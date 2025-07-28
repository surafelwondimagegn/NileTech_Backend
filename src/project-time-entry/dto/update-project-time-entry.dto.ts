import { PartialType } from '@nestjs/swagger';
import { CreateProjectTimeEntryDto } from './create-project-time-entry.dto';

export class UpdateProjectTimeEntryDto extends PartialType(CreateProjectTimeEntryDto) {}