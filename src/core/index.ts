import { initKafka } from 'kafka/kafkaTransport'
import { startHttpConfigWatcher } from './communication/config'
import { startResponseListener } from 'kafka/listener'

export * from '@core/utils/Log'
export * from '@core/communication'
export * from '@core/workflow/index'

export async function initPlatform() {
    await startHttpConfigWatcher()
    await initKafka()
    await startResponseListener()
}