import { startHttpConfigWatcher } from '@core/config'
import { initKafka } from 'kafka/kafkaTransport'
export async function initPlatform() {
    await startHttpConfigWatcher()
    await initKafka()
}