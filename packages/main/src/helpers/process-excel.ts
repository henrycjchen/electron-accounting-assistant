import {createInputs} from '../services/create-inputs';
import {createOutputs} from '../services/create-outputs';

export async function processExcel(files: Record<string, string>) {
  const outputs = await createOutputs(files.bills);
  
  await createInputs({
    filePath: files.calculate,
    outputs,
  });
}
