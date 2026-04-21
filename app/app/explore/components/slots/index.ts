import TechniquesOutSlot from './TechniquesOutSlot';
import TechniquesInSlot from './TechniquesInSlot';
import NotesSlot from './NotesSlot';

export type SlotProps = {
	position: any;
	techniques: any[];
};

export type SlotConfig = {
	id: string;
	label: string;
	component: React.ComponentType<SlotProps>;
};

export const DETAIL_SLOTS: SlotConfig[] = [
	{ id: 'techniques_out', label: 'Techniques out', component: TechniquesOutSlot },
	{ id: 'techniques_in',  label: 'Techniques in',  component: TechniquesInSlot },
	{ id: 'notes',          label: 'Notes',          component: NotesSlot },
];
