'use client';

import { useState } from 'react';
import { useTechniques, Technique, Position, Context } from './hooks/useTechniques';
import { useTechniqueForm } from './hooks/useTechniqueForm';
import { ACTORS, DISCIPLINES, DISCIPLINE_EFFECTIVENESS_LEVELS } from '@/lib/constants';

type TableProps = {
	techniques: Technique[];
	selectedId: string | null;
	onSelect: (t: Technique) => void;
	onDelete: (id: string) => void;
	positionLabel: (id: string) => string;
};

function TechniquesTable({
	techniques, selectedId,
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
					{techniques.map(t => (
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

					{techniques.length === 0 && (
						<tr>
							<td colSpan={5} className="empty-state">no techniques yet</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	);
}

type FormProps = {
	selected: Technique | null;
	positions: Position[];
	contexts: { discipline: string; effectiveness: string; }[];
	loading: boolean;
	register: any;
	handleSubmit: any;
	submit: any;
	allDisciplinesUsed: boolean;
	addContext: () => void;
	removeContext: (i: number) => void;
	updateContext: (i: number, field: keyof Context, value: string) => void;
	onCancel: () => void;
};

function TechniqueForm({
	selected, positions, contexts, loading,
	register, handleSubmit, submit, allDisciplinesUsed,
	addContext, removeContext, updateContext, onCancel,
}: FormProps) {
	return (
		<div className="panel-form">
			<div className="form-header">
				<span className="form-title">{selected ? 'edit technique' : 'new technique'}</span>
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
						<button
							type="button"
							className="btn btn-ghost"
							onClick={addContext}
							disabled={allDisciplinesUsed}
						>
							+ add
						</button>
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
								{DISCIPLINE_EFFECTIVENESS_LEVELS.map(e => <option key={e} value={e}>{e}</option>)}
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
					{loading ? 'saving...' : selected ? 'save changes' : 'create technique'}
				</button>
			</form>
		</div>
	);
}

export default function TechniquesPage() {
	const { techniques, positions, fetchAll, deleteTechnique } = useTechniques();
	const { register, handleSubmit, setValue, reset, contexts, addContext, removeContext, updateContext, loading, submit, allDisciplinesUsed } = useTechniqueForm(fetchAll);
	const [selected, setSelected] = useState<Technique | null>(null);

	function positionLabel(id: string) {
		const p = positions.find(p => p.id === id);
		return p ? `${p.name} (${p.perspective})` : id;
	}

	function selectTechnique(t: Technique) {
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
			<TechniquesTable
				techniques={techniques}
				selectedId={selected?.id ?? null}
				onSelect={selectTechnique}
				onDelete={deleteTechnique}
				positionLabel={positionLabel}
			/>
			<TechniqueForm
				selected={selected}
				positions={positions}
				contexts={contexts}
				loading={loading}
				register={register}
				handleSubmit={handleSubmit}
				submit={submit}
				allDisciplinesUsed={allDisciplinesUsed}
				addContext={addContext}
				removeContext={removeContext}
				updateContext={updateContext}
				onCancel={clearForm}
			/>
		</>
	);
}