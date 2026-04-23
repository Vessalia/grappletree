'use client';

import { useState } from 'react';
import { usePositions } from './hooks/usePositions';
import { usePositionForm } from './hooks/usePositionForm';

type Position = { id: string; name: string; notes: string; };

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
	loading: boolean;
	register: any;
	handleSubmit: any;
	submit: any;
	onCancel: () => void;
};

function PositionForm({
	selected, loading, register, handleSubmit, submit,
	onCancel
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
	const { register, handleSubmit, setValue, reset, control, loading, submit } = usePositionForm(fetchPositions);
	const [selected, setSelected] = useState<Position | null>(null);

	function selectPosition(p: Position) {
		setSelected(p);
		setValue('name', p.name);
		setValue('notes', p.notes);
	}

	function clearForm() {
		setSelected(null);
		reset();
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
				loading={loading}
				register={register}
				handleSubmit={handleSubmit}
				submit={submit}
				onCancel={clearForm}
			/>
		</>
	);
}
