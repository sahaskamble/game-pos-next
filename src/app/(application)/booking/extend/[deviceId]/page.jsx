'use client';

import React, { useEffect, useState, use } from 'react';
import { calculateSessionValues } from '@/lib/utils/calculateSessionValues';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCollection } from '@/lib/hooks/useCollection';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

export default function ExtendSessionPage({ params }) {
	const router = useRouter();
	const unwrappedParams = use(params);
	const deviceId = unwrappedParams.deviceId;

	const { data: devices, isLoading: devicesLoading } = useCollection("devices");
	const { data: settings, isLoading: settingsLoading } = useCollection("settings");
	const { data: sessions, isLoading: sessionsLoading, updateItem: updateSession } = useCollection("sessions", {
		filter: "status='Active'"
	});

	const [device, setDevice] = useState(null);
	const [deviceSettings, setDeviceSettings] = useState(null);
	const [loading, setLoading] = useState(true);
	const [formData, setformData] = useState({
		no_of_players: 1,
		duration_unit: "minutes",
		duration: 15,
		totalAmount: 0,
		before: 'after',
	});

	// First, get the device and its settings
	useEffect(() => {
		const initializeData = async () => {
			if (!devicesLoading && !settingsLoading && devices && settings && deviceId) {
				const foundDevice = devices.find(d => d.id === deviceId);
				if (foundDevice) {
					setDevice(foundDevice);
					const device_settings = settings.find((setting) =>
						setting.type === foundDevice.type && setting.branch_id === foundDevice.branch_id
					);
					setDeviceSettings(device_settings);
					setLoading(false);
				}
			}
		};

		initializeData();
	}, [deviceId, devices, settings, devicesLoading, settingsLoading]);

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (loading || !deviceSettings || !device) {
			toast.error('Please wait while we load the device settings...');
			return;
		}

		try {
			if (formData?.before === 'before') {

				// Find the session associated with this device
				const session = sessions?.find((session) => session?.device_id === device?.id && session?.status === 'Active');

				if (!session) {
					toast.error('No active session found for this device');
					router.push('/booking');
					return;
				}

				// Convert duration to hours for calculation
				const durationInHours = formData?.duration_unit === "minutes"
					? formData?.duration / 60
					: formData?.duration;

				// Calculate base price
				const sessionValues = calculateSessionValues(formData?.no_of_players, deviceSettings);
				const newBasePrice = sessionValues?.totalAmount * durationInHours;

				// Create a new Date object from session_out string
				const sessionOut = new Date(session?.session_in);

				// Add time based on form data
				if (formData.duration_unit === "minutes") {
					sessionOut.setMinutes(sessionOut?.getMinutes() + parseInt(formData?.duration) || 0);
				} else {
					sessionOut.setHours(sessionOut?.getHours() + parseInt(formData?.duration) || 0);
				}

				const sessionOutString = sessionOut?.toISOString();
				const updatePayload = {
					session_out: sessionOutString,
					duration: formData.duration,
					duration_unit: formData?.duration_unit,
					session_amount: newBasePrice || 0,
					total_amount: newBasePrice || 0,
					no_of_players: formData.no_of_players
				};
				await updateSession(session?.id, updatePayload);
				toast.success('Session updated successfully!');
				router.replace('/booking');
			} else {
				// Find the session associated with this device
				const session = sessions?.find((session) => session?.device_id === device?.id && session?.status === 'Active');

				if (!session) {
					toast.error('No active session found for this device');
					router.push('/booking');
					return;
				}

				// Convert duration to hours for calculation
				const durationInHours = formData?.duration_unit === "minutes"
					? formData?.duration / 60
					: formData?.duration;

				// Calculate base price
				const sessionValues = calculateSessionValues(formData?.no_of_players, deviceSettings);
				const basePrice = sessionValues?.totalAmount * durationInHours;

				// Create a new Date object from session_out string
				const sessionOut = new Date(session?.session_out);

				// Add time based on form data
				if (formData.duration_unit === "minutes") {
					sessionOut.setMinutes(sessionOut?.getMinutes() + parseInt(formData?.duration) || 0);
				} else {
					sessionOut.setHours(sessionOut?.getHours() + parseInt(formData?.duration) || 0);
				}

				const sessionOutString = sessionOut?.toISOString();

				// Calculate duration
				let duration = 0;
				let duration_unit = 'minutes';

				if (session?.duration_unit === formData?.duration_unit) {
					duration = (session?.duration + formData?.duration) || 0;
					duration_unit = session?.duration_unit || '';
				} else if (session?.duration_unit === 'minutes' && formData?.duration_unit === 'hours') {
					duration = (session?.duration / 60) + formData?.duration;
					duration_unit = 'hours';
				} else if (formData?.duration_unit === 'minutes' && session?.duration_unit === 'hours') {
					duration = session?.duration + durationInHours;
					duration_unit = 'hours';
				}

				const updatePayload = {
					session_out: sessionOutString,
					duration,
					duration_unit,
					session_amount: (session?.session_amount + basePrice) || 0,
					total_amount: (session?.total_amount + basePrice) || 0,
					no_of_players: formData.no_of_players
				};

				await updateSession(session?.id, updatePayload);
				toast.success('Session extended successfully!');
				router.replace('/booking');
			}
		} catch (error) {
			console.error("Error extending session:", error);
			toast.error('Error extending session, please try again later....');
		}
	}

	const handleDuration = (value) => {
		if (value === '') {
			setformData({
				...formData,
				duration: value
			});
		} else if (!isNaN(value)) {
			const max = formData?.duration_unit === 'minutes' ? 60 : 24
			setformData({
				...formData,
				duration: Number(value) > max ? max : Number(value)
			});
		} else {
			const max = formData?.duration_unit === 'minutes' ? 60 : 24
			setformData({
				...formData,
				duration: max
			});
		}
	}

	useEffect(() => {
		if (formData.no_of_players > device?.max_players) {
			setformData({ ...formData, no_of_players: device?.max_players })
		}
	}, [formData.no_of_players]);

	if (loading || devicesLoading || settingsLoading || sessionsLoading) {
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
					<CardTitle>{formData?.before === 'before' ? 'Edit' : 'Extend'} Session</CardTitle>
				</CardHeader>
				<form className='grid gap-4' onSubmit={handleSubmit}>
					<div className='mt-6 grid gap-2'>
						<Label>No. of Players</Label>
						<Input
							type='number'
							value={formData?.no_of_players}
							onChange={(e) => {
								const value = e.target.value;
								if (value === '') {
									setformData({
										...formData,
										no_of_players: value
									});
								} else if (!isNaN(value)) {
									setformData({
										...formData,
										no_of_players: Number(value)
									});
								} else {
									setformData({
										...formData,
										no_of_players: Number(device?.max_players) || 4
									});
								}
							}}
							min={1}
							max={device?.max_players || 4}
						/>
					</div>
					<div className='grid gap-2'>
						<Label>Duration</Label>
						<div className='flex flex-row-reverse items-center gap-2'>
							<Select
								value={formData.duration_unit}
								onValueChange={(value) => {
									// Reset duration when switching units
									const newDuration = value === "minutes" ? 15 : 1;
									setformData({ ...formData, duration_unit: value, duration: newDuration });
								}}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select unit" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="minutes">Minutes</SelectItem>
									<SelectItem value="hours">Hours</SelectItem>
								</SelectContent>
							</Select>
							<Input
								id="duration"
								type="number"
								min={formData.duration_unit === "minutes" ? 15 : 1}
								max={formData.duration_unit === "minutes" ? 60 : 24}
								step={formData.duration_unit === "minutes" ? 15 : 1}
								value={formData.duration}
								onChange={(e) => handleDuration(e.target.value)}
							/>
						</div>
					</div>
					<div className='grid gap-2'>
						<Label>Extension Time</Label>
						<div className='flex flex-row-reverse items-center gap-2'>
							<Select
								value={formData.before}
								onValueChange={(value) => {
									setformData({ ...formData, before: value });
								}}
							>
								<SelectTrigger>
									<SelectValue placeholder="Extension Time" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='before'>Before Session End</SelectItem>
									<SelectItem value='after'>After Session End</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					<Button type='submit'>
						Extend Session
					</Button>
				</form>
			</Card>
		</main>
	);
};
