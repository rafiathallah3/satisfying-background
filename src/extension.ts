import path = require('path');
import fs = require("fs");
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('satisfying-background.showBackground', () => {
			SatisfyingBackgroundPanel.createOrShow(context);
		})
	);

	if (vscode.window.registerWebviewPanelSerializer) {
		vscode.window.registerWebviewPanelSerializer(SatisfyingBackgroundPanel.viewType, {
			async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel) {
				webviewPanel.webview.options = getWebviewOptions(context.extensionUri);
				SatisfyingBackgroundPanel.revive(webviewPanel, context);
			}
		});
	}
}

function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewPanelOptions & vscode.WebviewOptions {
	return {
		enableScripts: true,
		retainContextWhenHidden: true,
		localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')],
	};
}

class SatisfyingBackgroundPanel {
	public static currentPanel: SatisfyingBackgroundPanel | undefined;

	public static readonly viewType = 'satisfying-background';

	private readonly _panel: vscode.WebviewPanel;
	private _extension: vscode.ExtensionContext;
	private _disposables: vscode.Disposable[] = [];

	public static createOrShow(extensionUri: vscode.ExtensionContext) {

		const panel = vscode.window.createWebviewPanel(
			SatisfyingBackgroundPanel.viewType,
			'Satisfying Background',
			vscode.ViewColumn.Active,
			getWebviewOptions(extensionUri.extensionUri),
		);

		SatisfyingBackgroundPanel.currentPanel = new SatisfyingBackgroundPanel(panel, extensionUri);
	}

	public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.ExtensionContext) {
		SatisfyingBackgroundPanel.currentPanel = new SatisfyingBackgroundPanel(panel, extensionUri);
	}

	private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.ExtensionContext) {
		this._panel = panel;
		this._extension = extensionUri;

		this._update();

		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		this._panel.webview.onDidReceiveMessage(
			message => {
				try {
					const filePath: vscode.Uri = vscode.Uri.file(path.join(this._extension.extensionPath, 'html', `${message.command}.html`));
					this._panel.webview.html = fs.readFileSync(filePath.fsPath, 'utf8');
				} catch {
					return;
				}
			},
			null,
			this._disposables
		);
	}

	public dispose() {
		SatisfyingBackgroundPanel.currentPanel = undefined;

		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

	private _update() {
		this._panel.webview.html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Satisfying Background</title>
</head>
<body>
    <h3>Select background</h3>
	<button onclick="GantiBackground('animasiBinary')">Binary Animation</button>
	<button onclick="GantiBackground('jepangMatrix')">Matrix Japanese</button>
	<button onclick="GantiBackground('kotakPutar')">Spinning Square</button>
	<button onclick="GantiBackground('matrix')">Matrix</button>
	<button onclick="GantiBackground('maze')">Maze Solution</button>
	<button onclick="GantiBackground('orbit')">Orbit</button>
	<button onclick="GantiBackground('piramidEnergi')">Energy Pyramid</button>
	<button onclick="GantiBackground('textJatuh')">Falling Text</button>
	<button onclick="GantiBackground('mazeGeneration')">Maze Generation</button>
	<button onclick="GantiBackground('mazeSpanningTree')">Maze Spanning Tree</button>
	<button onclick="GantiBackground('mazeFlood')">Maze Flood</button>

	<h3>Credit</h3>
	<div>Binary Animation: https://codepen.io/fmattuschka/pen/bjZKNQ</div>
	<div>Japanese Matrix: https://codepen.io/AdrianBL/details/WNqpmMg</div>
	<div>Matrix: https://codepen.io/gnsp/pen/vYBQZJm</div>
	<div>Spinning Square: still Not found, sorry</div>
	<div>Maze: https://codepen.io/infinitestack/details/MWMbJMb</div>
	<div>Orbit: https://codepen.io/megh-bari/pen/gOJeZXv</div>
	<div>Energy Pyramid: https://codepen.io/juan-antonio-ledesma/pen/bGOadXb</div>
	<div>Maze Generation: https://gist.githubusercontent.com/mbostock/70a28267db0354261476/raw/a95cc3f21d7705dbea95d205b3b92c29272c2df8/index.html</div>
	<div>Maze Spanning Tree: https://gist.githubusercontent.com/mbostock/11159599/raw/c5561515e3ed5b208fe731750b513bf66257234d/index.html</div>
	<div>Maze Flood: https://gist.githubusercontent.com/mbostock/11167589/raw/59f11a98cd3b111c12858107f4621fbb9f39807f/index.html</div>

	<script>
	const vscode = acquireVsCodeApi();

	function GantiBackground(text) {
		console.log(text);
		if(text === undefined) {
			return;
		}
		
		vscode.setState(text);
		vscode.postMessage({
			command: text
		})
	}

	GantiBackground(vscode.getState());
	</script>
</body>
</html>
		`;
	}
}