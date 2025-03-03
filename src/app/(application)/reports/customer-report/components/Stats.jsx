import {
	Card,
	CardHeader,
	CardDescription,
	CardTitle,
} from "@/components/ui/card";

export const StatsCard = ({ Stats }) => {
	return (
		<>
			{
				Stats.map((stat, index) => (
					<Card key={index} className='px-2'>
						<div className="flex items-center justify-between">
							<CardHeader>
								<CardDescription>{stat.title}</CardDescription>
								<CardTitle>{stat.price}</CardTitle>
							</CardHeader>
							<div className="flex justify-center items-center h-full">
								<div className={stat.iconClass}>
									<stat.icon size={20} color={stat.iconColor} />
								</div>
							</div>
						</div>
					</Card>
				))
			}
		</>
	)
}
