'use client';

import { useState } from 'react';
import { useWatch } from 'react-hook-form';

import { usePositions } from './hooks/usePositions';
import { usePositionForm } from './hooks/usePositionForm';
import { useReciprocal } from './hooks/useReciprocal';

import { PERSPECTIVES, OPPOSING_PERSPECTIVES } from '@/lib/constants';

export default function PositionsPage() {

	const { positions, fetchPositions, deletePosition } = usePositions();

	const {
		register,
		handleSubmit,
		setValue,
		reset,
		control,
		loading,
		submit
	} = usePositionForm(fetchPositions);

	const [selected, setSelected] = useState<any>(null);

	const perspective = useWatch({ control, name: 'perspective' });

	const {
		createReciprocal,
		setCreateReciprocal,
		isNeutral
	} = useReciprocal(perspective);

	function selectPosition(p: any) {
		setSelected(p);
		setValue('name', p.name);
		setValue('perspective', p.perspective);
		setValue('notes', p.notes);
	}

	function clearForm() {
		setSelected(null);
		reset();
	}

	return (
		<>
			<div className="panel-list">
				<table className="data-table">
					<thead>
						<tr>
							<th>Name</th>
							<th>Perspective</th>
							<th></th>
						</tr>
					</thead>

					<tbody>
						{positions.map(p => (
							<tr
								key={p.id}
								onClick={() => selectPosition(p)}
								className={selected?.id === p.id ? 'selected' : ''}
							>
								<td className="cell-primary">{p.name}</td>

								<td className="cell-secondary">
									<span className="badge">{p.perspective}</span>
								</td>

								<td style={{ textAlign: 'right' }}>
									<button
										className="btn btn-danger"
										onClick={e => {
											e.stopPropagation();
											deletePosition(p.id);
										}}
									>
										delete
									</button>
								</td>
							</tr>
						))}

						{positions.length === 0 && (
							<tr>
								<td colSpan={3} className="empty-state">
									no positions yet
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			<div className="panel-form">

				<div className="form-header">
					<span className="form-title">
						{selected ? 'edit position' : 'new position'}
					</span>

					{selected && (
						<button className="btn btn-ghost" onClick={clearForm}>
							cancel
						</button>
					)}
				</div>

				<form onSubmit={handleSubmit(data => submit(data, selected, createReciprocal))}>

					<div className="form-section">
						<label className="form-label">Name</label>

						<input
							className="form-input"
							{...register('name', { required: true })}
							placeholder="e.g. Mount"
						/>
					</div>

					<div className="form-section">
						<label className="form-label">Perspective</label>

						<select
							className="form-select"
							{...register('perspective', { required: true })}
						>
							{PERSPECTIVES.map(p => (
								<option key={p} value={p}>
									{p}
								</option>
							))}
						</select>
					</div>

					{!selected && (
						<div className="form-section">
							<label className={`checkbox-label ${isNeutral ? 'disabled' : ''}`}>
								<input
									type="checkbox"
									checked={createReciprocal}
									disabled={isNeutral}
									onChange={e => setCreateReciprocal(e.target.checked)}
								/>

								also create "
								{OPPOSING_PERSPECTIVES[perspective] ?? '—'}
								" version
							</label>
						</div>
					)}

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
		</>
	);
}
