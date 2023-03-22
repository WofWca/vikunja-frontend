// https://kolaente.dev/vikunja/api/src/commit/066c26f83e1e066bdc9d80b4642db1df0d6a77eb/pkg/models/tasks.go#L874-L880
export function defaultPositionIfZero(/* entityID: number, */ position: number): number {
	if (position === 0) {
		return /* entityID * */ 2**16
	}

	return position
}