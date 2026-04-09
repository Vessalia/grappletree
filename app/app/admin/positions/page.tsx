'use client';

import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

type Position = {
	id: string;
	name: string;
	perspective: string;
	notes: string;
};

type FormData = {
	name: string;
	perspective: string;
	notes: string;
};

const PERSPECTIVES = ['top', 'bottom', 'attacker', 'defender', 'neutral'];

const OPPOSING: Record<string, string> = {
	top: 'bottom',
	bottom: 'top',
	attacker: 'defender',
	defender: 'attacker',
};

export default function PositionsPage() {
	const [positions, setPositions] = useState<Position[]>([]);
	const [selected, setSelected] = useState<Position | null>(null);
	const [loading, setLoading] = useState(false);
	const [createReciprocal, setCreateReciprocal] = useState(false);

	const { register, handleSubmit, reset, setValue, control } = useForm<FormData>({
		defaultValues: {
			name: '',
			perspective: 'neutral',
			notes: '',
		}
	});

	const perspective = useWatch({ control, name: 'perspective' });
	const isNeutral = perspective === 'neutral' || !OPPOSING[perspective];

	async function fetchPositions() {
		const res = await fetch('/api/positions');
		const data = await res.json();
		setPositions(data);
	}

	useEffect(() => {
		fetchPositions();
	}, []);

	useEffect(() => {
		if (isNeutral) setCreateReciprocal(false);
	}, [isNeutral]);

	function selectPosition(position: Position) {
		setSelected(position);
		setValue('name', position.name);
		setValue('perspective', position.perspective);
		setValue('notes', position.notes);
	}

	function clearForm() {
		setSelected(null);
		setCreateReciprocal(false);
		reset();
	}

	async function onSubmit(data: FormData) {
		setLoading(true);
		try {
			if (selected) {
				await fetch(`/api/positions/${selected.id}`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(data),
				});
			} else {
				await fetch('/api/positions', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(data),
				});
				if (createReciprocal && OPPOSING[data.perspective]) {
					await fetch('/api/positions', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							name: data.name,
							perspective: OPPOSING[data.perspective],
							notes: data.notes,
						}),
					});
				}
			}
			await fetchPositions();
			clearForm();
		} finally {
			setLoading(false);
		}
	}

	async function deletePosition(id: string) {
		if (!confirm('Delete this position? All connected transitions will also be deleted.')) return;
		await fetch(`/api/positions/${id}`, { method: 'DELETE' });
		await fetchPositions();
		clearForm();
	}

	return (
		<div style={{ display: 'flex', gap: '32px' }}>
			<div style={{ flex: 1 }}>
				<h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px' }}>Positions</h1>
				<table style={{ width: '100%', borderCollapse: 'collapse' }}>
					<thead>
						<tr style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
							<th style={{ padding: '8px 12px' }}>Name</th>
							<th style={{ padding: '8px 12px' }}>Perspective</th>
							<th style={{ padding: '8px 12px' }}></th>
						</tr>
					</thead>
					<tbody>
						{positions.map(position => (
							<tr
							key={position.id}
							onClick={() => selectPosition(position)}
							style={{
								borderBottom: '1px solid #f3f4f6',
								cursor: 'pointer',
								background: selected?.id === position.id ? '#f3f4f6' : 'transparent',
							}}
							>
								<td style={{ padding: '8px 12px' }}>{position.name}</td>
								<td style={{ padding: '8px 12px', color: '#6b7280' }}>{position.perspective}</td>
								<td style={{ padding: '8px 12px', textAlign: 'right' }}>
									<button
									onClick={e => { e.stopPropagation(); deletePosition(position.id); }}
									style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
									>
									Delete
									</button>
								</td>
							</tr>
						))}
						{positions.length === 0 && (
							<tr>
								<td colSpan={3} style={{ padding: '24px 12px', color: '#9ca3af', textAlign: 'center' }}>
									No positions yet
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			<div style={{ width: '320px', borderLeft: '1px solid #e5e7eb', paddingLeft: '32px' }}>
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
					<h2 style={{ fontSize: '18px', fontWeight: 600 }}>
						{selected ? 'Edit Position' : 'New Position'}
					</h2>
					{selected && (
					<button onClick={clearForm} style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
						Cancel
					</button>
					)}
				</div>

				<form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
					<div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
						<label style={{ fontSize: '14px', fontWeight: 500 }}>Name</label>
						<input
							{...register('name', { required: true })}
							placeholder="e.g. Mount Top"
							style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' }}
						/>
					</div>

					<div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
						<label style={{ fontSize: '14px', fontWeight: 500 }}>Perspective</label>
						<select
							{...register('perspective', { required: true })}
							style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' }}
						>
							{PERSPECTIVES.map(p => (
								<option key={p} value={p}>{p}</option>
							))}
						</select>
					</div>

					<div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
						<label style={{ fontSize: '14px', fontWeight: 500 }}>Notes</label>
						<textarea
							{...register('notes')}
							placeholder="Optional notes..."
							rows={3}
							style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', resize: 'vertical' }}
						/>
					</div>

					{!selected && (
					<label style={{
						display: 'flex',
						alignItems: 'center',
						gap: '8px',
						fontSize: '14px',
						color: isNeutral ? '#9ca3af' : 'inherit',
						cursor: isNeutral ? 'not-allowed' : 'pointer',
					}}>
						<input
							type="checkbox"
							checked={createReciprocal}
							disabled={isNeutral}
							onChange={e => setCreateReciprocal(e.target.checked)}
						/>
						Also create {perspective && OPPOSING[perspective] ? `"${OPPOSING[perspective]}" version` : 'opposing position'}
					</label>
					)}

					<button
						type="submit"
						disabled={loading}
						style={{
							padding: '8px 16px',
							background: '#111827',
							color: 'white',
							border: 'none',
							borderRadius: '6px',
							fontSize: '14px',
							cursor: loading ? 'not-allowed' : 'pointer',
							opacity: loading ? 0.7 : 1,
						}}
						>
						{loading ? 'Saving...' : selected ? 'Save Changes' : 'Create Position'}
					</button>
				</form>
			</div>
		</div>
	);
}