import { Button } from "@/components/ui/button";
import { CirclePlus, CopyCheck, RefreshCcw } from "lucide-react";
import { useCollection } from "@/lib/hooks/useCollection";
import { toast } from "sonner";

const calculateValues = ({ sessions, membershipLogs, cashlogs, start, end, branch_id }) => {
	const Filteredsessions = sessions?.filter((session) => {
		const createdDate = new Date(session.created);
		return createdDate >= start && createdDate <= end && session.branch_id === branch_id;
	});
	const FilteredMemberships = membershipLogs?.filter((log) => {
		const createdDate = new Date(log.created);
		return createdDate >= start && createdDate <= end && log.branch_id === branch_id;
	});
	const FilteredCashlogs = cashlogs?.filter((cashlog) => {
		const createdDate = new Date(cashlog.created);
		return createdDate >= start && createdDate <= end && cashlog.branch_id === branch_id;
	});

	const sales = {
		membership: {
			count: FilteredMemberships.length,
			amount: FilteredMemberships?.reduce((acc, log) => acc + log.expand.plan_id.selling_price, 0),
		},
		snacks: {
			amount: Filteredsessions?.reduce((acc, session) => acc + session.snacks_total, 0),
		},
		sessions: {
			count: Filteredsessions.length,
			amount: Filteredsessions?.reduce((acc, session) => acc + session.amount_paid - (session?.snacks_total || 0), 0)
		}
	};

	const expenses = {
		count: FilteredCashlogs.length,
		amount: FilteredCashlogs?.reduce((acc, cashlog) => acc + Number(cashlog?.withdraw_from_drawer?.amount) || 0, 0),
	}
	const total = (sales.membership.amount + sales.sessions.amount + sales.snacks.amount) - (expenses.amount);

	return { sales, expenses, total };
}


export default function InitialiseValues({
	mutate = () => { },
	sessions = [],
	cashlogs = [],
	membershipLogs = [],
	drawer_log = {},
	selectedBranch = null,
	range = '',
} = {}) {
	const { data: cash_drawer_logs, updateItem: editDrawer, createItem: addDrawerEntry } = useCollection('cash_drawer', {
		expand: 'branch_id',
		sort: '-created',
	});

	const today = new Date();
	const start = today.setHours(0, 0, 0);
	const end = today.setHours(23, 59, 59);

	const handleRefresh = async () => {
		try {
			const { sales, expenses, total } = calculateValues({ sessions, membershipLogs, cashlogs, start, end, branch_id: selectedBranch });
			const log_info = cash_drawer_logs.find((log) => log.branch_id === selectedBranch);
			if (!log_info) {
				return;
			}
			await editDrawer(log_info.id, {
				sales,
				expenses,
				closing_balance: total + log_info.opening_balance
			});
			toast.success('Values updated!!!');
			mutate();
		} catch (error) {
			toast.error('Error refreshing values, please try again later...')
		}
	}

	const handleClose = async () => {
		try {
			const { sales, expenses, total } = calculateValues({ sessions, membershipLogs, cashlogs, start, end, branch_id: selectedBranch });
			const log_info = cash_drawer_logs.find((log) => log.branch_id === selectedBranch);
			await editDrawer(log_info.id, {
				sales,
				expenses,
				closing_balance: total + log_info.opening_balance,
				status: 'Closed'
			});
			toast.success('Day Closed!!!');
			mutate();
		} catch (error) {
			toast.error('Error closing day, please try again later...')
		}
	}

	const handleInitialise = async () => {
		try {
			const { sales, expenses, total } = calculateValues({ sessions, membershipLogs, cashlogs, start, end, branch_id: selectedBranch });
			const log_info = cash_drawer_logs.find((log) => log.branch_id === selectedBranch);
			await addDrawerEntry({
				opening_balance: log_info?.closing_balance || 0,
				sales,
				expenses,
				closing_balance: total + log_info?.closing_balance || 0,
				status: 'Active',
				branch_id: selectedBranch,
			});
			toast.success('Initialised Values!!!');
			mutate();
		} catch (error) {
			toast.error('Error initialising, please try again later...')
		}
	}

	return (
		<>
			{
				(selectedBranch && range === 'today') && (
					<div className="flex gap-3">
						{
							drawer_log?.length > 0 ? (
								<Button variant='outline' onClick={handleRefresh}>
									<RefreshCcw /> Refresh Values
								</Button>
							) : (
								<Button variant='outline' onClick={handleInitialise}>
									<CirclePlus /> Initialise Values
								</Button>
							)
						}
						<Button
							disabled={drawer_log?.[0]?.status === 'Closed'}
							variant='destructive'
							onClick={handleClose}
						>
							<CopyCheck />
							Close Day
						</Button>
					</div>
				)
			}
		</>
	);
};

// <------------- If in future the requirement comes for auto entry for all branches ------------->
// const handleRefresh = async () => {
// 	try {
// 		if (selectedBranch) {
// 			const { sales, expenses, total } = calculateValues({ sessions, membershipLogs, cashlogs, start, end, branch_id: selectedBranch });
// 			const log_info = cash_drawer_logs.find((log) => log.branch_id === selectedBranch);
// 			if (!log_info) {
// 				return;
// 			}
// 			await editDrawer(log_info.id, {
// 				sales,
// 				expenses,
// 				closing_balance: total
// 			});
// 		} else {
// 			branches.map(async (branch) => {
// 				console.log('Branch', branch)
// 				const { sales, expenses, total } = calculateValues({ sessions, membershipLogs, cashlogs, start, end, branch_id: branch.id });
// 				const log_info = cash_drawer_logs.find((log) => log.branch_id === branch.id);
// 				if (log_info) {
// 					await editDrawer(log_info?.id, {
// 						sales,
// 						expenses,
// 						closing_balance: total
// 					});
// 				} else {
// 					await addDrawerEntry({
// 						opening_balance: log_info?.closing_balance || 0,
// 						sales,
// 						expenses,
// 						closing_balance: total,
// 						status: 'Active',
// 						branch_id: branch.id,
// 					});
// 				}
// 			});
// 		}
// 		toast.success('Values updated!!!');
// 		mutate();
// 	} catch (error) {
// 		toast.error('Error refreshing values, please try again later...')
// 	}
// }
//
// const handleClose = async () => {
// 	try {
// 		const { sales, expenses, total } = calculateValues();
// 		await editDrawer(cash_drawer_logs[0].id, {
// 			sales,
// 			expenses,
// 			closing_balance: total,
// 			status: 'Closed'
// 		});
// 		toast.success('Day Closed!!!');
// 		mutate();
// 	} catch (error) {
// 		toast.error('Error closing day, please try again later...')
// 	}
// }
//
// const handleInitialise = async () => {
// 	try {
// 		branches.map(async (branch) => {
// 			const { sales, expenses, total } = calculateValues({ sessions, membershipLogs, cashlogs, start, end, branch_id: branch.id });
// 			const log_info = cash_drawer_logs.find((log) => log.branch_id === branch.id);
// 			await addDrawerEntry({
// 				opening_balance: log_info?.closing_balance || 0,
// 				sales,
// 				expenses,
// 				closing_balance: total,
// 				status: 'Active',
// 				branch_id: branch.id,
// 			});
// 		});
// 		toast.success('Initialised Values!!!');
// 		mutate();
// 	} catch (error) {
// 		toast.error('Error initialising, please try again later...')
// 	}
// }

