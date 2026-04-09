'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

type Position = {
	id: string;
	name: string;
	perspective: string;
};

type Context = {
	discipline: string;
	effectiveness: string;
};

type Transition = {
	id: string;
	name: string;
	actor: string;
	notes: string;
	fromId: string;
	toId: string;
	contexts: Context[];
};

type FormData = {
	name: string;
	fromId: string;
	toId: string;
	actor: string;
	notes: string;
};

const ACTORS = ['attacker', 'defender', 'either'];
const DISCIPLINES = ['bjj', 'mma', 'wrestling'];
const EFFECTIVENESS = ['core', 'effective', 'situational', 'ineffective'];

export default function TransitionsPage() {
	const [transitions, setTransitions] = useState<Transition[]>([]);
	const [positions, setPositions] = useState<Position[]>([]);
	const [selected, setSelected] = useState<Transition | null>(null);
	const [contexts, setContexts] = useState<Context[]>([]);
	const [loading, setLoading] = useState(false);

	const { register, handleSubmit, reset, setValue } = useForm<FormData>();

	async function fetchAll() {
		const [tRes, pRes] = await Promise.all([
			fetch('/api/transitions'),
			fetch('/api/positions'),
		]);
		const [tData, pData] = await Promise.all([tRes.json(), pRes.json()]);
		setTransitions(tData);
		setPositions(pData);
	}

	useEffect(() => {
		fetchAll();
	}, []);

	function selectTransition(transition: Transition) {
		setSelected(transition);
		setValue('name', transition.name);
		setValue('fromId', transition.fromId);
		setValue('toId', transition.toId);
		setValue('actor', transition.actor);
		setValue('notes', transition.notes);
		setContexts(transition.contexts ?? []);
	}

	function clearForm() {
		setSelected(null);
		reset();
		setContexts([]);
	}

	function addContext() {
		setContexts(prev => [...prev, { discipline: 'bjj', effectiveness: 'core' }]);
	}

	function removeContext(index: number) {
		setContexts(prev => prev.filter((_, i) => i !== index));
	}

	function updateContext(index: number, field: keyof Context, value: string) {
		setContexts(prev => prev.map((ctx, i) => i === index ? { ...ctx, [field]: value } : ctx));
	}

	async function onSubmit(data: FormData) {
		setLoading(true);
		try {
			if (selected) {
			await fetch(`/api/transitions/${selected.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ...data, contexts }),
			});
			} else {
			await fetch('/api/transitions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ...data, contexts }),
			});
			}
			await fetchAll();
			clearForm();
		} finally {
			setLoading(false);
		}
	}

	async function deleteTransition(id: string) {
		if (!confirm('Delete this transition?')) return;
		await fetch(`/api/transitions/${id}`, { method: 'DELETE' });
		await fetchAll();
		clearForm();
	}

	function positionLabel(id: string) {
		const p = positions.find(p => p.id === id);
		return p ? `${p.name} (${p.perspective})` : id;
	}

	return (
		<div style={{ display: 'flex', gap: '32px' }}>
			<div style={{ flex: 1 }}>
				<h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px' }}>Transitions</h1>
				<table style={{ width: '100%', borderCollapse: 'collapse' }}>
					<thead>
						<tr style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
							<th style={{ padding: '8px 12px' }}>Name</th>
							<th style={{ padding: '8px 12px' }}>From</th>
							<th style={{ padding: '8px 12px' }}>To</th>
							<th style={{ padding: '8px 12px' }}>Actor</th>
							<th style={{ padding: '8px 12px' }}></th>
						</tr>
					</thead>
					<tbody>
					{transitions.map(transition => (
						<tr
							key={transition.id}
							onClick={() => selectTransition(transition)}
							style={{
								borderBottom: '1px solid #f3f4f6',
								cursor: 'pointer',
								background: selected?.id === transition.id ? '#f3f4f6' : 'transparent',
						}}
						>
							<td style={{ padding: '8px 12px' }}>{transition.name}</td>
							<td style={{ padding: '8px 12px', color: '#6b7280' }}>{positionLabel(transition.fromId)}</td>
							<td style={{ padding: '8px 12px', color: '#6b7280' }}>{positionLabel(transition.toId)}</td>
							<td style={{ padding: '8px 12px', color: '#6b7280' }}>{transition.actor}</td>
							<td style={{ padding: '8px 12px', textAlign: 'right' }}>
								<button
									onClick={e => { e.stopPropagation(); deleteTransition(transition.id); }}
									style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
								>
									Delete
								</button>
							</td>
						</tr>
					))}
					{transitions.length === 0 && (
						<tr>
							<td colSpan={5} style={{ padding: '24px 12px', color: '#9ca3af', textAlign: 'center' }}>
								No transitions yet
							</td>
						</tr>
					)}
					</tbody>
				</table>
			</div>

			<div style={{ width: '340px', borderLeft: '1px solid #e5e7eb', paddingLeft: '32px' }}>
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
					<h2 style={{ fontSize: '18px', fontWeight: 600 }}>
						{selected ? 'Edit Transition' : 'New Transition'}
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
							placeholder="e.g. Scissor Sweep"
							style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' }}
						/>
					</div>

					<div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
						<label style={{ fontSize: '14px', fontWeight: 500 }}>From</label>
						<select
							{...register('fromId', { required: true })}
							style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' }}
						>
							<option value="">Select position</option>
							{positions.map(p => (
								<option key={p.id} value={p.id}>{p.name} ({p.perspective})</option>
							))}
						</select>
					</div>

					<div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
						<label style={{ fontSize: '14px', fontWeight: 500 }}>To</label>
						<select
							{...register('toId', { required: true })}
							style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' }}
						>
							<option value="">Select position</option>
							{positions.map(p => (
								<option key={p.id} value={p.id}>{p.name} ({p.perspective})</option>
							))}
						</select>
					</div>

					<div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
						<label style={{ fontSize: '14px', fontWeight: 500 }}>Actor</label>
						<select
							{...register('actor', { required: true })}
							style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' }}
						>
							<option value="">Select actor</option>
							{ACTORS.map(a => (
								<option key={a} value={a}>{a}</option>
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

					<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
							<label style={{ fontSize: '14px', fontWeight: 500 }}>Discipline contexts</label>
							<button
								type="button"
								onClick={addContext}
								style={{ fontSize: '13px', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}
							>
								+ Add
							</button>
						</div>
						{contexts.map((ctx, i) => (
							<div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
								<select
									value={ctx.discipline}
									onChange={e => updateContext(i, 'discipline', e.target.value)}
									style={{ flex: 1, padding: '6px 8px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px' }}
								>
									{DISCIPLINES.map(d => <option key={d} value={d}>{d}</option>)}
								</select>
								<select
									value={ctx.effectiveness}
									onChange={e => updateContext(i, 'effectiveness', e.target.value)}
									style={{ flex: 1, padding: '6px 8px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px' }}
								>
									{EFFECTIVENESS.map(e => <option key={e} value={e}>{e}</option>)}
								</select>
								<button
									type="button"
									onClick={() => removeContext(i)}
									style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
								>
									x
								</button>
							</div>
						))}
					</div>

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
						{loading ? 'Saving...' : selected ? 'Save Changes' : 'Create Transition'}
					</button>
				</form>
			</div>
		</div>
	);
}