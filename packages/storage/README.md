# @roboforge/storage

Typed storage and SQLite repository service for RoboForge.
Manages database migrations, progress tracking, user settings, and `.roboforge` backup export/import.

## Usage

```ts
import { StorageService } from '@roboforge/storage';

const storage = new StorageService();
await storage.setProgress('m01-l01', 'completed');
```
