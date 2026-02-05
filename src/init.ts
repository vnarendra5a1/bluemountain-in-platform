import { startHttpConfigWatcher } from '@core/config'
import { initKafka } from 'kafka'
export async function initPlatform() {
    await startHttpConfigWatcher()
    await initKafka()
}