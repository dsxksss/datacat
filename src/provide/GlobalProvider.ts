import { ExtensionContext, Webview } from "vscode";

type GlobalProviderOption = ExtensionContext | Webview;

export class GlobalProvider {
    private static _instance: GlobalProvider;
    private _globalMap: Map<string, GlobalProviderOption>;

    private constructor() {
        this._globalMap = new Map<string, any>();
    }

    public static get instance() {
        // 如果实例不存在则创建一个新的，否则返回已有的
        return this._instance || (this._instance = new this());
    }

    // 设置全局变量
    public set(key: string, value: any): void {
        this._globalMap.set(key, value);
    }

    // 获取全局变量
    public get(key: string): GlobalProviderOption | any {
        return this._globalMap.get(key);
    }
}