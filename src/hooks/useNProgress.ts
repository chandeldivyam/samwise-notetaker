import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

export function useNProgress() {
	const start = () => {
		NProgress.start();
	};

	const done = () => {
		NProgress.done();
	};

	return { start, done };
}
