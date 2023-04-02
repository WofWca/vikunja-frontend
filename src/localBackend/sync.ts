import * as Y from 'yjs'
import { IndexeddbPersistence as YjsIndexeddbPersistence } from 'y-indexeddb'
import type { Webxdc as WebxdcGeneric } from './webxdc'

type Webxdc = WebxdcGeneric<{
	update: number[],
	sender: typeof webxdc.selfAddr
}>
declare const webxdc: Webxdc;
// declare global {
// 	interface Window {
// 		webxdc: Webxdc;
// 	}
// }

/**
 * @returns resolves when all the pending updates have been applied
 */
function initWebxdcSyncProvider(ydoc: Y.Doc): Promise<void> {
	// TODO_OFFLINE I'm not sure at all if this is correct. Namely:
	// I'm not sure if it is right to never apply updates that we've already applied
	// in the previos sessions, as it looks like that we rely on `IndexeddbPersistence`
	// to save all the applied updates. What happens if it for some reason doesn't manage
	// to not save some update? In theore we'd have to download it from other peers then, right?
	// But we don't do it here.
	//
	// Better check how existing providers work, like `y-websocket`. Looks like they use
	// `y-protocols/sync`.

	// const lastAppliedWebxdcUpdateSerialNum = localStorage.getItem('__lastAppliedWebxdcUpdate')
	const lastAppliedWebxdcUpdateSerialNum = 0

	const setListenerP = webxdc.setUpdateListener(
		(update) => {
			// if (update.payload.sender === webxdc.selfAddr) {
			// 	return
			// }
			console.log('update', update.serial)
			// TODO_OFFLINE optimize this. Batch updates? ydoc.transact?
			Y.applyUpdate(ydoc, new Uint8Array(update.payload.update), 'webxdcUpdateHandler')
			// localStorage.setItem('__lastAppliedWebxdcUpdate', update.serial.toString())
		},
		lastAppliedWebxdcUpdateSerialNum
			? parseInt(lastAppliedWebxdcUpdateSerialNum)
			: 0,
	)

	// TODO_OFFLINE throttle
	// TODO not sure if this reacts to the changes 
	ydoc.on('update', (update, origin) => {
		if (origin === 'webxdcUpdateHandler') {
			return
		}
		// TODO_OFFLINE conversion to an ordinary array. Not good for performance.
		// Look up how other Yjs connectors do this. Or
		// https://docs.yjs.dev/api/document-updates#example-base64-encoding
		const serializableArray = [...(update as Uint8Array)]
		webxdc.sendUpdate({
				payload: {
					update: serializableArray,
					sender: webxdc.selfAddr
				},
			},
			''
		)
	})

	return setListenerP
}

async function maybeInitWebrtcSync(ydoc: Y.Doc) {
	if (localStorage.getItem('sharingEnabled') !== 'true') {
		return
	}
	const sharingRoomName = localStorage.getItem('sharingRoomName')
	if (sharingRoomName == null) {
		return
	}
	const sharingRoomPassword = localStorage.getItem('sharingRoomPassword')
	if (sharingRoomPassword == null) {
		return
	}
	const { WebrtcProvider } = await import('y-webrtc')
	// To avoid collisions when people are lazy about coming up with a long enough name.
	const fullRoomName = `vikunja-${sharingRoomName}`
	const provider = new WebrtcProvider(fullRoomName, ydoc, { password: sharingRoomPassword })
	console.log('WebRTC sharing enabled')
}

async function createSyncedYDoc(): Promise<Y.Doc> {
	const ydoc = new Y.Doc()

	const indexeddbProvider = new YjsIndexeddbPersistence('p2p-tasks-db', ydoc)
	// Did not check if we actually need to await
	await indexeddbProvider.whenSynced

	if (window.webxdc) {
		// TODO_OFFLINE dynamic import
		await initWebxdcSyncProvider(ydoc)
	} else {
		await maybeInitWebrtcSync(ydoc)
	}


	// const lastAppliedWebxdcUpdate = localStorage.getItem('__lastAppliedWebxdcUpdate')
	// // function onWebxdcUpdate()
	// const onWebxdcUpdate: Parameters<Webxdc['setUpdateListener']>[0] = (update) => {
	// 	// update.
	// }

	return ydoc
}

let _ydoc: Promise<Y.Doc> | undefined = undefined
export const ensureCreateSyncedYDoc = () => {
	if (!_ydoc) {
		// TODO_OFFLINE fix: if you call it twice in a row before it resolves,
		// `createSyncedYDoc` will be exected twice. Don't await.
		_ydoc = createSyncedYDoc()
	}
	return _ydoc
}
