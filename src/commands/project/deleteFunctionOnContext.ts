import { Uri } from "vscode";
import { deleteFunction } from "@shared/deleteFunction";

export async function deleteFunctionOnContext(dir: Uri) {
  const dirArr = dir.path.split("/");
  const func = dirArr.pop();
  const [addon] = dirArr.slice(-2);

  await deleteFunction(addon, func!);
}
