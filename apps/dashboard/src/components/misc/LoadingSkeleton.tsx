import { FC } from 'react';
import { CgSpinnerTwo } from 'react-icons/cg';

export const LoadingSkeleton: FC = () => (
	<div className="flex h-screen w-screen items-center justify-center">
		<CgSpinnerTwo size={40} className="animate-spin" />
	</div>
);
