import { Uri } from "vscode";

export async function deleteFunctionOnContext(dir: Uri) {
  const dirArr = dir.path.split("/");
  const func = dirArr.pop();
  const [addon] = dirArr.slice(-2);

  // delete
}
