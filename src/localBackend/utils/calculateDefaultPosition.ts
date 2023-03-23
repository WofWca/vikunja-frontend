// https://kolaente.dev/vikunja/api/src/commit/066c26f83e1e066bdc9d80b4642db1df0d6a77eb/pkg/models/tasks.go#L874-L880
// TODO_OFFLINE this is wrong. For example, for buckets. it is possible to create several buckets
// with position: 65535, which would mess up positioning. Looks like we actually need to consider
// position. How about store `lastUsedGlobalId` in `localStorage` and simply increment it each
// time an entity is created?
export function defaultPositionIfZero(/* entityID: number, */ position: number): number {
	if (position === 0) {
		return /* entityID * */ 2**16
	}

	return position
}