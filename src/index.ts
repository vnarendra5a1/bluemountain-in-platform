export * as Core from '@core/index'

import { startHttpConfigWatcher } from '@core/communication/config'
import { initKafka } from 'kafka/kafkaTransport'

export async function initPlatform() {
    await startHttpConfigWatcher()
    await initKafka()
}