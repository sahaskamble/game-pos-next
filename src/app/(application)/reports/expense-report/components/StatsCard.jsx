import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export const StatsCard = ({ Stats }) => {
	return (
		<>
			{Stats.map((stat, index) => (
				<Card key={index} className='px-4 py-2'>
					<div className="flex items-center justify-between">
						<CardHeader>
							<CardDescription>{stat.title}</CardDescription>
							<CardTitle>{stat.value}</CardTitle>
						</CardHeader>
						<div className="flex justify-center items-center h-full">
							{stat.icon && (
								<div className={stat.iconClass}>
									<stat.icon size={20} color={stat.iconColor} />
								</div>
							)}
						</div>
					</div>
				</Card>
			))}
		</>
	);
};
