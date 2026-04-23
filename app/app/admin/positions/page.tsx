'use client';

import { useState } from 'react';
import { usePositions, Position, Context } from './hooks/usePositions';
import { usePositionForm } from './hooks/usePositionForm';
import { DISCIPLINES, EFFECTIVENESS_LABELS } from '@/lib/constants';

type TableProps = {
	positions: Position[];
	selectedId: string | null;
	onSelect: (p: Position) => void;
	onDelete: (id: string) => void;
};

function PositionsTable({
	positions, selectedId,
	onSelect, onDelete
}: TableProps) {
	return (
		<div className="panel-list">
			<table className="data-table">
				<thead>
					<tr>
						<th>Name</th>
						<th></th>
					</tr>
				</thead>

				<tbody>
					{positions.map(p => (
						<tr
							key={p.id}
							onClick={() => onSelect(p)}
							className={selectedId === p.id ? 'selected' : ''}
						>
							<td className="cell-primary">{p.name}</td>
							<td className="cell-secondary">{p.notes}</td>
							<td style={{ textAlign: 'right' }}>
								<button
									className="btn btn-danger"
									onClick={e => { e.stopPropagation(); onDelete(p.id); }}
								>
									delete
								</button>
							</td>
						</tr>
					))}

					{positions.length === 0 && (
						<tr>
							<td colSpan={3} className="empty-state">no positions yet</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	);
}

type FormProps = {
	selected: Position | null;
	contexts: { name: string; effectiveness: string; }[];
	loading: boolean;
	register: any;
	handleSubmit: any;
	submit: any;
	addContext: () => void;
	removeContext: (i: number) => void;
	updateContext: (i: number, field: keyof Context, value: string) => void;
	onCancel: () => void;
};

function PositionForm({
	selected, contexts, loading, register, handleSubmit, submit,
	addContext, removeContext, updateContext, onCancel
}: FormProps) {
	return (
		<div className="panel-form">
			<div className="form-header">
				<span className="form-title">{selected ? 'edit position' : 'new position'}</span>
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
						placeholder="e.g. Mount"
					/>
				</div>

				<div className="form-section">
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
						<label className="form-label" style={{ margin: 0 }}>Discipline contexts</label>
						<button
							type="button"
							className="btn btn-ghost"
							onClick={addContext}
						>
							+ add
						</button>
					</div>

					{contexts.map((ctx, i) => (
						<div key={i} className="context-row">
							<select
								className="form-select"
								value={ctx.name}
								onChange={e => updateContext(i, 'name', e.target.value)}
							>
								{DISCIPLINES.map(d => <option key={d} value={d}>{d}</option>)}
							</select>

							<select
								className="form-select"
								value={ctx.effectiveness}
								onChange={e => updateContext(i, 'effectiveness', e.target.value)}
							>
								{EFFECTIVENESS_LABELS.map(e => <option key={e} value={e}>{e}</option>)}
							</select>

							<button type="button" className="btn btn-danger" onClick={() => removeContext(i)}>×</button>
						</div>
					))}
				</div>

				<div className="form-section">
					<label className="form-label">Notes</label>
					<textarea
						className="form-textarea"
						{...register('notes')}
						placeholder="Optional notes..."
					/>
				</div>
				
				<button
					className="btn btn-primary"
					type="submit"
					disabled={loading}
					style={{ width: '100%' }}
				>
					{loading ? 'saving...' : selected ? 'save changes' : 'create position'}
				</button>
			</form>
		</div>
	);
}

export default function PositionsPage() {
	const { positions, fetchPositions, deletePosition } = usePositions();
	const {
		register,
		handleSubmit,
		setValue,
		reset,
		control,
		contexts,
		setContexts,
		addContext,
		removeContext,
		updateContext,
		loading,
		submit
	} = usePositionForm(fetchPositions);
	const [selected, setSelected] = useState<Position | null>(null);

	function selectPosition(p: Position) {
		setSelected(p);
		setValue('name', p.name);
		setValue('notes', p.notes);

		setContexts(p.contexts ?? []);
	}

	function clearForm() {
		setSelected(null);
		reset();
		setContexts([]);
	}

	return (
		<>
			<PositionsTable
				positions={positions}
				selectedId={selected?.id ?? null}
				onSelect={selectPosition}
				onDelete={deletePosition}
			/>
			<PositionForm
				selected={selected}
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
