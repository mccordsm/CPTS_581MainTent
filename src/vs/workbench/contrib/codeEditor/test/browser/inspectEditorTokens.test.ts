/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as assert from 'assert';
import { Position } from 'vs/editor/common/core/position';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { TextModel } from 'vs/editor/common/model/textModel';
import { createTestCodeEditor, ITestCodeEditor } from 'vs/editor/test/browser/testCodeEditor';
import { createTextModel } from 'vs/editor/test/common/testTextModel';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ServiceCollection } from 'vs/platform/instantiation/common/serviceCollection';
import { InspectEditorTokensController } from 'vs/workbench/contrib/codeEditor/browser/inspectEditorTokens/inspectEditorTokens';
import { ITextMateService } from 'vs/workbench/services/textMate/browser/textMate';
import { IGrammar, ITokenizeLineResult, ITokenizeLineResult2, StackElement } from 'vscode-textmate';



suite('inspectEditorTokens', function () {
	class TestGrammar implements IGrammar {
		tokenizeLine(_lineText: string, _prevState: StackElement | null, _timeLimit?: number | undefined): ITokenizeLineResult {
			return {
				tokens: [
					{ startIndex: 0, endIndex: 5, scopes: ['text.html.markdown', 'meta.paragraph.markdown'] },
					{ startIndex: 5, endIndex: 6, scopess: ['text.html.markdown', 'meta.paragraph.markdown', 'markup.math.inline.markdown', 'punctuation.definition.math.begin.markdown'] },
					{ startIndex: 6, endIndex: 10, scopes: ['text.html.markdown', 'meta.paragraph.markdown', 'markup.math.inline.markdown', 'meta.embedded.math.markdown', 'constant.numeric.math.tex'] },
					{ startIndex: 10, endIndex: 11, scopes: ['text.html.markdown', 'meta.paragraph.markdown', 'markup.math.inline.markdown', 'punctuation.definition.math.begin.markdown'] },
					{ startIndex: 11, endIndex: 13, scopes: ['text.html.markdown', 'meta.paragraph.markdown'] },
				],
				ruleStack: null,
			} as unknown as ITokenizeLineResult;
		}
		tokenizeLine2(_lineText: string, _prevState: StackElement | null, _timeLimit?: number | undefined): ITokenizeLineResult2 {
			return {
				tokens: [
					0, 33588268, 6, 33752101, 10, 33588268
				]
			} as unknown as ITokenizeLineResult2;
		}

	}


	async function retTestGrammar(_position: Position): Promise<IGrammar | null> {
		return new TestGrammar();
	}

	const testTextMate = {
		onDidEncounterLanguage: () => { },
		createGrammar: retTestGrammar,
		startDebugMode: () => { }
	} as unknown as ITextMateService;


	const serviceCollection = new ServiceCollection();
	serviceCollection.set(ITextMateService, testTextMate);
	serviceCollection.set(IConfigurationService, {
		getValue: (_section: string) => {
			return { enabled: false };
		},
		onDidChangeConfiguration: (_) => {

		}
	} as IConfigurationService);
	serviceCollection.set(ILanguageService, {
		languageIdCodec: {
			decodeLanguageId: (langID: number) => {
				if (langID === 37) {
					return 'latex';
				} else {
					return 'markdown';
				}
			}
		}
	} as unknown as ILanguageService);

	let controller: InspectEditorTokensController;
	let editor: ITestCodeEditor;
	let model: TextModel;

	setup(() => {
		model = createTextModel('##title\n1234 $5678$ ');
		editor = createTestCodeEditor(model, { serviceCollection });
		editor.setPosition(new Position(2, 11));
		editor.getModel().setMode('markdown');
		controller = editor.registerAndInstantiateContribution(InspectEditorTokensController.ID, InspectEditorTokensController);
		controller.launch();
	});

	teardown(() => {
		controller.dispose();
		editor.dispose();
		model.dispose();
	});

	test('issue #148644, language scope markdown math', async function () {
		// await timeout(10);
		const testLanguageTexts = ['latex', 'markdown'];
		let languageIndex = 0;
		controller.updateListener = () => {
			const languageText = editor.getDomNode().getElementsByClassName('tiw-metadata-value')[0].textContent;
			assert.strictEqual(languageText, testLanguageTexts[languageIndex]);
			languageIndex++;
		};

		editor.setPosition(new Position(2, 12));
	});


});
