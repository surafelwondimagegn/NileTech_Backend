import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectTimeEntryDto } from './create-project-time-entry.dto';

export class UpdateProjectTimeEntryDto extends PartialType(CreateProjectTimeEntryDto) {}