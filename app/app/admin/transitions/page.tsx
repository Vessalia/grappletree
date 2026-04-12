'use client';

import { useState } from 'react';
import { useTransitions, Transition, Position, Context } from './hooks/useTransitions';
import { useTransitionForm } from './hooks/useTransitionForm';

const ACTORS = ['attacker', 'defender', 'either'];
const DISCIPLINES = ['bjj', 'mma', 'wrestling'];
const EFFECTIVENESS = ['core', 'effective', 'situational', 'ineffective'];

type TableProps = {
	transitions: Transition[];
	selectedId: string | null;
	onSelect: (t: Transition) => void;
	onDelete: (id: string) => void;
	positionLabel: (id: string) => string;
};

function TransitionsTable({
	transitions, selectedId,
	onSelect, onDelete, positionLabel 
}: TableProps) {
	return (
		<div className="panel-list">
			<table className="data-table">
				<thead>
					<tr>
						<th>Name</th>
						<th>From</th>
						<th>To</th>
						<th>Actor</th>
						<th></th>
					</tr>
				</thead>

				<tbody>
					{transitions.map(t => (
						<tr
							key={t.id}
							onClick={() => onSelect(t)}
							className={selectedId === t.id ? 'selected' : ''}
						>
							<td className="cell-primary">{t.name}</td>
							<td className="cell-secondary">{positionLabel(t.fromId)}</td>
							<td className="cell-secondary">{positionLabel(t.toId)}</td>
							<td><span className="badge">{t.actor}</span></td>
							<td style={{ textAlign: 'right' }}>
								<button
									className="btn btn-danger"
									onClick={e => { e.stopPropagation(); onDelete(t.id); }}
								>
									delete
								</button>
							</td>
						</tr>
					))}

					{transitions.length === 0 && (
						<tr>
							<td colSpan={5} className="empty-state">no transitions yet</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	);
}

type FormProps = {
	selected: Transition | null;
	positions: Position[];
	contexts: { discipline: string; effectiveness: string; }[];
	loading: boolean;
	register: any;
	handleSubmit: any;
	submit: any;
	addContext: () => void;
	removeContext: (i: number) => void;
	updateContext: (i: number, field: keyof Context, value: string) => void;
	onCancel: () => void;
};

function TransitionForm({
	selected, positions, contexts, loading,
	register, handleSubmit, submit,
	addContext, removeContext, updateContext, onCancel,
}: FormProps) {
	return (
		<div className="panel-form">
			<div className="form-header">
				<span className="form-title">{selected ? 'edit transition' : 'new transition'}</span>
				{selected && (
					<button className="btn btn-ghost" onClick={onCancel}>cancel</button>
				)}
			</div>

			<form onSubmit={handleSubmit((data: any) => submit(data, selected))}>
				<div className="form-section">
					<label className="form-label">Name</label>
					<input
						className="form-input"
						{...register('name', { required: true })}
						placeholder="e.g. Scissor Sweep"
					/>
				</div>

				<div className="form-section">
					<label className="form-label">From</label>
					<select className="form-select" {...register('fromId', { required: true })}>
						{positions.map(p => (
							<option key={p.id} value={p.id}>{p.name} ({p.perspective})</option>
						))}
					</select>
				</div>

				<div className="form-section">
					<label className="form-label">To</label>
					<select className="form-select" {...register('toId', { required: true })}>
						{positions.map(p => (
							<option key={p.id} value={p.id}>{p.name} ({p.perspective})</option>
						))}
					</select>
				</div>

				<div className="form-section">
					<label className="form-label">Actor</label>
					<select className="form-select" {...register('actor', { required: true })}>
						{ACTORS.map(a => <option key={a} value={a}>{a}</option>)}
					</select>
				</div>

				<div className="form-section">
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
						<label className="form-label" style={{ margin: 0 }}>Discipline contexts</label>
						<button type="button" className="btn btn-ghost" onClick={addContext}>+ add</button>
					</div>

					{contexts.map((ctx, i) => (
						<div key={i} className="context-row">
							<select
								className="form-select"
								value={ctx.discipline}
								onChange={e => updateContext(i, 'discipline', e.target.value)}
							>
								{DISCIPLINES.map(d => <option key={d} value={d}>{d}</option>)}
							</select>

							<select
								className="form-select"
								value={ctx.effectiveness}
								onChange={e => updateContext(i, 'effectiveness', e.target.value)}
							>
								{EFFECTIVENESS.map(e => <option key={e} value={e}>{e}</option>)}
							</select>

							<button type="button" className="btn btn-danger" onClick={() => removeContext(i)}>×</button>
						</div>
					))}
				</div>

				<button
					className="btn btn-primary"
					type="submit"
					disabled={loading}
					style={{ width: '100%' }}
				>
					{loading ? 'saving...' : selected ? 'save changes' : 'create transition'}
				</button>
			</form>
		</div>
	);
}

export default function TransitionsPage() {
	const { transitions, positions, fetchAll, deleteTransition } = useTransitions();
	const { register, handleSubmit, setValue, reset, contexts, addContext, removeContext, updateContext, loading, submit } = useTransitionForm(fetchAll);
	const [selected, setSelected] = useState<Transition | null>(null);

	function positionLabel(id: string) {
		const p = positions.find(p => p.id === id);
		return p ? `${p.name} (${p.perspective})` : id;
	}

	function selectTransition(t: Transition) {
		setSelected(t);
		setValue('name', t.name);
		setValue('fromId', t.fromId);
		setValue('toId', t.toId);
		setValue('actor', t.actor);
		setValue('notes', t.notes);
	}

	function clearForm() {
		setSelected(null);
		reset();
	}

	return (
		<>
			<TransitionsTable
				transitions={transitions}
				selectedId={selected?.id ?? null}
				onSelect={selectTransition}
				onDelete={deleteTransition}
				positionLabel={positionLabel}
			/>
			<TransitionForm
				selected={selected}
				positions={positions}
				contexts={contexts}
				loading={loading}
				register={register}
				handleSubmit={handleSubmit}
				submit={submit}
				addContext={addContext}
				removeContext={removeContext}
				updateContext={updateContext}
				onCancel={clearForm}
			/>
		</>
	);
}