import { useEffect, useState } from 'react';
import { OPPOSING_PERSPECTIVES } from '@/lib/constants';

export function useReciprocal(perspective: string) {
	const [createReciprocal, setCreateReciprocal] = useState(false);
	const isNeutral = perspective === 'neutral' || !OPPOSING_PERSPECTIVES[perspective];

	useEffect(() => {
		if (isNeutral) {
			setCreateReciprocal(false);
		}
	}, [isNeutral]);

	return {
		createReciprocal,
		setCreateReciprocal,
		isNeutral
	};
}
