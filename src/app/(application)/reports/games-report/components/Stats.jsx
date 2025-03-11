import { Blue600, Green600, Purple600, Orange600 } from "@/constants/colors"
import { Gamepad2, Activity, Trophy, Clock } from "lucide-react"
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";

export const StatsCard = ({ stats }) => {
  const Stats = [
    {
      title: 'Total Games',
      mainText: stats.totalGames,
      icon: Gamepad2,
      iconColor: Blue600
    },
    {
      title: 'Active Games',
      mainText: stats.activeGames,
      icon: Activity,
      iconColor: Green600
    },
    {
      title: 'Most Popular',
      mainText: stats.popularGame,
      icon: Trophy,
      iconColor: Purple600
    },
    {
      title: 'Avg. Playtime',
      mainText: `${stats.averagePlayTime} hr`,
      icon: Clock,
      iconColor: Orange600
    },
  ];

  return (
    <>
      {Stats.map((stat, index) => (
        <Card key={index} className='h-[100px] rounded-xl p-4'>
          <div className="">
            <div className="flex justify-between">
              <h1 className="text-gray-400">{stat.title}</h1>
              <stat.icon size={20} color={stat.iconColor} />
            </div>
            <div>
              <h1 className="font-bold text-xl">{stat.mainText}</h1>
            </div>
          </div>
        </Card>
      ))}
    </>
  );
};