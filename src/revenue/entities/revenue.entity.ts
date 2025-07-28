import { ApiProperty } from '@nestjs/swagger';

export class Revenue {
  @ApiProperty({ description: 'Unique identifier for the revenue' })
  id: number;

  @ApiProperty({ description: 'Associated project ID', required: false })
  projectId?: number;

  @ApiProperty({ description: 'Associated invoice ID', required: false })
  invoiceId?: number;

  @ApiProperty({ description: 'Associated sold product ID', required: false })
  soldProductId?: number;

  @ApiProperty({ description: 'Revenue amount' })
  amount: number;

  @ApiProperty({ description: 'When the revenue was received' })
  receivedAt: Date;

  @ApiProperty({ description: 'Associated sold service ID', required: false })
  soldServiceId?: number;

  @ApiProperty({ description: 'Associated project', required: false })
  project?: any;

  @ApiProperty({ description: 'Associated invoice', required: false })
  invoice?: any;

  @ApiProperty({ description: 'Associated sold product', required: false })
  soldProduct?: any;

  @ApiProperty({ description: 'Associated sold service', required: false })
  soldService?: any;
}
