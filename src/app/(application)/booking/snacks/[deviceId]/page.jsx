'use client';

import React, { useEffect, useState, use } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useCollection } from '@/lib/hooks/useCollection';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function SnackSessionPage({ params }) {
	const router = useRouter();
	const unwrappedParams = use(params);
	const deviceId = unwrappedParams.deviceId;

	const { data: devices } = useCollection("devices");
	const { data: sessions, updateItem: updateSession } = useCollection("sessions", {
		filter: "status='Active'"
	});
	const { data: snacks, updateItem: updateSnacksQuantity } = useCollection("snacks");
	const { createItem: createSessionSnack } = useCollection("session_snack");
	const { user } = useAuth();

	const [device, setDevice] = useState({});
	const [session, setSession] = useState(null);
	const [loading, setLoading] = useState(false);
	const [selectedSnacks, setSelectedSnacks] = useState([]);

	// First, get the device
	useEffect(() => {
		if (devices && deviceId) {
			const foundDevice = devices.find(d => d.id === deviceId);
			if (foundDevice) {
				setDevice(foundDevice);
			}
		}
	}, [deviceId, devices]);

	const handleSnackAdd = (snackId) => {
		const snack = snacks.find(s => s.id === snackId);
		if (!snack) return;

		setSelectedSnacks(prev => {
			const existing = prev.find(s => s.id === snackId);
			if (existing) {
				return prev.map(s => s.id === snackId ? { ...s, quantity: s.quantity + 1 } : s);
			}
			return [...prev, { id: snackId, name: snack.name, price: snack.price, quantity: 1 }];
		});
	};

	const handleSnackQuantity = (snackId, change) => {
		setSelectedSnacks(prev => prev.map(snack => {
			if (snack.id === snackId) {
				const newQuantity = Math.max(0, snack.quantity + change);
				return { ...snack, quantity: newQuantity };
			}
			return snack;
		}).filter(snack => snack.quantity > 0));
	};

	const handleAddSnacksToSession = async (e) => {
		e.preventDefault();
		try {
			const snacksTotal = selectedSnacks.reduce((acc, snack) => {
				return acc + (snack.price * snack.quantity);
			}, 0);

			// Update session with new total
			await updateSession(session.id, {
				snacks_total: (session.snacks_total || 0) + snacksTotal,
				total_amount: session.total_amount + snacksTotal
			});

			// Create session_snack entries
			for (const snack of selectedSnacks) {
				const sessionSnack = await createSessionSnack({
					session_id: session.id,
					snack_id: snack.id,
					quantity: snack.quantity,
					price: snack.price * snack.quantity,
					branch_id: user.branch_id,
					user_id: user.id,
				});

				// Update snack quantity in snacks collection
				try {
					const currentSnack = snacks.find((s) => s.id === snack.id);
					const newQuantity = currentSnack.quanity - snack.quantity;
					await updateSnacksQuantity(snack.id, {
						quanity: newQuantity
					});
				} catch (error) {
					console.error(`Error updating quantity for snack ${snack.id}:`, error);
					toast.error(`Failed to update quantity for ${snack.name}`);
				}
			}

			toast.success("Snacks added successfully");
			setSelectedSnacks([]);
			router.replace('/booking');
		} catch (error) {
			console.error("Error adding snacks:", error);
			toast.error("Failed to add snacks");
		}
	};

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				if (!device?.id) {
					setLoading(false);
					return;
				}

				const matchingSession = sessions.find((s) => s.device_id === device.id && s.status === 'Active');
				if (matchingSession) {
					setSession(matchingSession);
					console.log('Matching Session', matchingSession);
				}
			} catch (error) {
				console.log(error);
			} finally {
				setLoading(false);
			}
		}

		fetchData();
	}, [device?.id, sessions]);


	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			</div>
		);
	}
	return (
		<main className='p-8'>
			<Card className="max-w-full md:max-w-2xl mx-auto p-6">
				<CardHeader>
					<CardTitle>Add Snacks</CardTitle>
				</CardHeader>
				<form className='grid gap-4' onSubmit={(e) => handleAddSnacksToSession(e)}>
					<div className="space-y-2">
						<Label>Select Snacks</Label>
						<Select onValueChange={handleSnackAdd}>
							<SelectTrigger>
								<SelectValue placeholder="Add Snack" />
							</SelectTrigger>
							<SelectContent>
								{snacks?.map(snack => (
									<SelectItem key={snack.id} value={snack.id}>
										{snack.name} - ₹{snack.price}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<div className="space-y-2">
							{selectedSnacks.map(snack => (
								<div key={snack.id} className="flex items-center justify-between">
									<span>{snack.name} - ₹{snack.price}</span>
									<div className="flex items-center gap-2">
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => handleSnackQuantity(snack.id, -1)}
										>
											-
										</Button>
										<span>{snack.quantity}</span>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => handleSnackQuantity(snack.id, 1)}
										>
											+
										</Button>
									</div>
								</div>
							))}
						</div>

						<Button
							type='submit'
							className="w-full"
						>
							Add Snacks
						</Button>
					</div>
				</form>
			</Card>
		</main>
	);
};
