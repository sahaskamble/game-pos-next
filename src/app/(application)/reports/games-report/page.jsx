'use client';

import React, { useEffect, useState } from 'react'
import { StatsCard } from './components/Stats';
import { ChartComponent } from './components/Charts';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { GameTable } from './components/GameTable';
import { useCollection } from "@/lib/hooks/useCollection";
import { format } from 'date-fns';
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Line, Cell } from 'recharts';
import { CustomTooltip } from './components/CustomTooltip';

function GameReports() {
  const { data: games } = useCollection("games");
  const { data: sessions } = useCollection("sessions", {
    expand: 'game_id,customer_id',
    sort: '-created'
  });

  const [stats, setStats] = useState({
    totalGames: 0,
    activeGames: 0,
    popularGame: '',
    averagePlayTime: 0
  });

  const [monthlyPlaytime, setMonthlyPlaytime] = useState([]);
  const [popularityData, setPopularityData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [gameTypeData, setGameTypeData] = useState([]); // Add this state

  useEffect(() => {
    if (games && sessions) {
      // Calculate basic stats
      const totalGames = games.length;
      const activeGames = games.filter(game => game.status === 'active').length;

      // Calculate game popularity and average playtime
      const gameStats = games.reduce((acc, game) => {
        const gameSessions = sessions.filter(s => s.game_id === game.id);
        const totalPlaytime = gameSessions.reduce((sum, session) => {
          return sum + (session.duration || 0);
        }, 0);

        acc[game.id] = {
          name: game.name,
          sessions: gameSessions.length,
          totalPlaytime,
          averagePlaytime: gameSessions.length ? totalPlaytime / gameSessions.length : 0,
          revenue: gameSessions.reduce((sum, session) => sum + (session.total_amount || 0), 0)
        };
        return acc;
      }, {});

      // Calculate game type data
      const typeData = Object.entries(
        games.reduce((acc, game) => {
          const stats = gameStats[game.id];
          if (!acc[game.type]) {
            acc[game.type] = {
              count: 0,
              totalDuration: 0
            };
          }
          acc[game.type].count++;
          acc[game.type].totalDuration += stats.averagePlaytime;
          return acc;
        }, {})
      ).map(([type, data]) => ({
        type: type === 'PS' ? 'PlayStation' : 'VR Games',
        avgDuration: Math.round(data.totalDuration / data.count) // Round to whole number
      }));

      // Prepare popularity data
      const popularityStats = Object.values(gameStats)
        .map(game => ({
          name: game.name,
          sessions: game.sessions,
          revenue: game.revenue
        }))
        .sort((a, b) => b.sessions - a.sessions);

      // Find most popular game
      const popularGame = Object.values(gameStats)
        .sort((a, b) => b.sessions - a.sessions)[0];

      // Calculate overall average playtime
      const totalSessions = Object.values(gameStats)
        .reduce((sum, game) => sum + game.sessions, 0);
      const averagePlayTime = totalSessions ?
        Object.values(gameStats)
          .reduce((sum, game) => sum + game.totalPlaytime, 0) / totalSessions : 0;

      // Prepare monthly data
      const monthlyData = sessions.reduce((acc, session) => {
        const month = format(new Date(session.created), 'MMM yyyy');
        if (!acc[month]) {
          acc[month] = { playtime: 0, revenue: 0 };
        }
        acc[month].playtime += session.duration || 0;
        acc[month].revenue += session.total_amount || 0;
        return acc;
      }, {});

      // Transform data for charts
      const monthlyPlaytimeData = Object.entries(monthlyData)
        .map(([month, data]) => ({
          month,
          playtime: Math.round(data.playtime / 60) // Convert to hours
        }));

      const monthlyRevenueData = Object.entries(monthlyData)
        .map(([month, data]) => ({
          month,
          revenue: data.revenue
        }));

      // Update all states
      setStats({
        totalGames,
        activeGames,
        popularGame: popularGame?.name || '-',
        averagePlayTime: Math.round(averagePlayTime / 60)
      });

      setGameTypeData(typeData);
      setPopularityData(popularityStats);
      setMonthlyPlaytime(monthlyPlaytimeData);
      setRevenueData(monthlyRevenueData);
    }
  }, [games, sessions]);

  if (!games || !sessions) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Stats Cards */}
      <div className="p-6">
        <div className="grid auto-rows-min gap-4 md:grid-cols-4">
          <StatsCard stats={stats} />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-2 gap-4 p-4">
        <ChartComponent
          title="Monthly Playtime (Hours)"
          data={monthlyPlaytime}
          period="month"
          dataKey="playtime"
          gradientColor="#22c55e"
          showDetails={true}
        />

        <ChartComponent
          title="Monthly Revenue"
          data={revenueData}
          period="month"
          dataKey="revenue"
          prefix="₹"
          showDetails={true}
        />
      </div>

      {/* Game Analytics Section */}
      <div className="grid grid-cols-1 gap-4 p-4">
        {/* Game Popularity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Game Popularity Distribution</CardTitle>
            <CardDescription>Top games by session count and revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={popularityData.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#888', fontSize: 12 }}
                    angle={-25}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fill: '#888', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fill: '#888', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    yAxisId="left"
                    dataKey="sessions"
                    fill="#8b5cf6"
                    radius={[4, 4, 0, 0]}
                  >
                    {popularityData.slice(0, 5).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(${index * 25 + 200}, 70%, 60%)`} />
                    ))}
                  </Bar>
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', strokeWidth: 2 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Games Table */}
      <div className="p-4">
        <GameTable games={games} sessions={sessions} />
      </div>
    </div>
  );
}

export default GameReports;
