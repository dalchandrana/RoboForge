# @roboforge/graders

Deterministic, pure auto-graders for RoboForge quizzes and numeric exercises.

## Usage

```ts
import { gradeNumeric, gradeQuizItem } from '@roboforge/graders';

const result = gradeNumeric(10.02, 10.0, 0.05, 'V');
```
