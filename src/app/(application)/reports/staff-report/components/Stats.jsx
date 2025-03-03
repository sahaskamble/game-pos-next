import { Blue600, Green600, Purple600, Yellow600 } from "@/constants/colors"
import { CalendarX, HandCoins, MoveDown, MoveUp, UserCheck, Users } from "lucide-react"
import {
	Card,
	CardHeader,
	CardDescription,
	CardTitle,
} from "@/components/ui/card";

export const StatsCard = () => {

	const Stats = [
		{
			title: 'Total Staff',
			mainText: '24',
			icon: Users,
			iconColor: Blue600
		},
		{
			title: 'Present Today',
			mainText: '92%',
			icon: UserCheck,
			iconColor: Green600
		},
		{
			title: 'Leave Requests',
			mainText: '5',
			icon: CalendarX,
			iconColor: Yellow600
		},
		{
			title: 'Monthly Expenses',
			mainText: '₹12,450',
			icon: HandCoins,
			iconColor: Purple600
		},
	]

	return (
		<>
			{
				Stats.map((stat, index) => (
					<Card key={index} className='h-[100px] rounded-xl p-4'>
						<div key={index} className="">
							<div className="flex justify-between">
								<h1 className="text-gray-400">{stat.title}</h1>
								<stat.icon size={20} color={stat.iconColor} />
							</div>
							<div>
								<h1 className="font-bold text-xl">{stat?.mainText}</h1>
							</div>
						</div>
					</Card>
				))
			}
		</>
	)
}
