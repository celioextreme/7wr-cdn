async function sendNextPrompt() {
    if (promptQueue.length === 0) {
        finishAutomation();
        return;
    }

    let prompt = promptQueue.shift();
    let tempMessage = createTemporaryMessage(prompt);
    document.body.appendChild(tempMessage);

    try {
        if (!isFirstPrompt) {
            await new Promise(resolve => setTimeout(resolve, 5000));
        }

        // Coloca o texto no textarea
        let textarea = document.querySelector("#prompt-textarea");
        
        // Cria um evento de input
        const inputEvent = new InputEvent('input', {
            bubbles: true,
            cancelable: true,
        });

        // Define o valor e dispara o evento
        textarea.textContent = prompt;
        textarea.dispatchEvent(inputEvent);

        // Aguarda um curto período antes de tentar clicar no botão
        await new Promise(resolve => setTimeout(resolve, 500));

        // Tenta clicar no botão várias vezes
        let buttonClicked = false;
        for (let i = 0; i < 5; i++) {
            try {
                let sendButton = await waitForSendButton(8000);
                sendButton.click();
                buttonClicked = true;
                break;
            } catch (error) {
                console.log(`Tentativa ${i + 1} de clicar no botão falhou. Tentando novamente...`);
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        if (!buttonClicked) {
            throw new Error("Não foi possível clicar no botão após várias tentativas");
        }

        // Verifica se a mensagem foi enviada
        let messageSent = await waitForMessageSent();
        if (!messageSent) {
            throw new Error("A mensagem não foi enviada após clicar no botão");
        }

        await waitForNewMessage(tempMessage);
        await waitForResponse();
        isFirstPrompt = false;
        setTimeout(sendNextPrompt, 500);
    } catch (error) {
        console.error("Erro em sendNextPrompt:", error);
        isFirstPrompt = false;
        setTimeout(sendNextPrompt, 1000);
    }
}
