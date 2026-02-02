export * as Core from '@core/index'

import { startHttpConfigWatcher } from '@core/config'
import { initKafka } from 'kafka/kafkaTransport'

export async function initPlatform() {
    await startHttpConfigWatcher()
    await initKafka()
}