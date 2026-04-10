import TransitionsOutSlot from './TransitionsOutSlot';
import TransitionsInSlot from './TransitionsInSlot';
import NotesSlot from './NotesSlot';

export type SlotProps = {
	position: any;
	transitions: any[];
};

export type SlotConfig = {
	id: string;
	label: string;
	component: React.ComponentType<SlotProps>;
};

export const DETAIL_SLOTS: SlotConfig[] = [
	{ id: 'transitions_out', label: 'Transitions out', component: TransitionsOutSlot },
	{ id: 'transitions_in',  label: 'Transitions in',  component: TransitionsInSlot },
	{ id: 'notes',           label: 'Notes',           component: NotesSlot },
];
