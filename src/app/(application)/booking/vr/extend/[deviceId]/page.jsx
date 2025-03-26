'use client';

import React, { useEffect, useState, use } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCollection } from '@/lib/hooks/useCollection';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

export default function ExtendSessionPage({ params }) {
	const router = useRouter();
	const unwrappedParams = use(params);
	const deviceId = unwrappedParams.deviceId;

	const { data: devices } = useCollection("devices");
	const { data: games } = useCollection("games");
	const { data: sessions, updateItem: updateSession } = useCollection("sessions", {
		filter: "status='Active'"
	});

	const [device, setDevice] = useState({});
	const [formData, setFormData] = useState({
		game_id: '',
		branch_id: '',
		totalAmount: 0,
	});

	// First, get the device
	useEffect(() => {
		if (devices && deviceId) {
			const foundDevice = devices.find(d => d?.id === deviceId);
			if (foundDevice) {
				setDevice(foundDevice);
				const branchId = localStorage.getItem('branch_id');
				setFormData({ ...formData, branch_id: branchId });
			}
		}
	}, [deviceId, devices]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			// Find the session associated with this device
			const session = await sessions?.find((session) => session?.device_id === device?.id && session?.status === 'Active');

			if (!session) {
				toast.error('No active session found for this device');
				router.push('/booking');
				return;
			}

			const game = games?.find((game_info) => game_info?.id === formData?.game_id);
			const basePrice = game?.price || 0;
			const updatePayload = {
				session_amount: session?.session_amount + basePrice,
				total_amount: session?.total_amount + basePrice,
			};

			await updateSession(session?.id, updatePayload);
			toast.success('Session extended successfully!');
			router.replace('/booking');

		} catch (error) {
			console.log("Error extending session:", error);
			toast.error('Error extending session, please try again later....');
		}
	}


	return (
		<main className='p-8'>
			<Card className="max-w-full md:max-w-2xl mx-auto p-6">
				<CardHeader>
					<CardTitle>Extend VR Session</CardTitle>
				</CardHeader>
				<form className='grid gap-4' onSubmit={handleSubmit}>
					<div className='mt-6 grid gap-2'>
						<Label>Game</Label>
						<Select
							value={formData?.game_id}
							onValueChange={(value) => setFormData(prev => ({ ...prev, game_id: value }))}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select Game" />
							</SelectTrigger>
							<SelectContent>
								{games
									?.filter((game) => game?.type === 'VR' && game?.branch_id === formData?.branch_id)
									?.map(game => (
										<SelectItem key={game.id} value={game?.id}>
											{game.name}
										</SelectItem>
									))}
							</SelectContent>
						</Select>
					</div>
					<Button type='submit'>
						Extend Session
					</Button>
				</form>
			</Card>
		</main>
	);
};
