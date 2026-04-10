import { SlotProps } from './index';

export default function NotesSlot({ position }: SlotProps) {
	if (!position?.notes) return <div className="explore-empty">no notes</div>;
	return <div className="explore-notes">{position.notes}</div>;
}
