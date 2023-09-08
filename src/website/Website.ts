import puppeteer, {Browser, Page} from 'puppeteer';

/**
 * Wrapper for a website.
 */
export class Website {
    private browser: Browser;
    page: Page;
    private url: string;

    constructor(url: string) {
        this.url = url;
        this.initialize = this.initialize.bind(this);
        this.click = this.click.bind(this);
        this.addValueToTextBox = this.addValueToTextBox.bind(this);
        this.readDivProperty = this.readDivProperty.bind(this);
        this.close = this.close.bind(this);
    }

    async initialize() {
        this.browser = await puppeteer.launch({ headless: false });
        this.page = await this.browser.newPage();
        await this.page.goto(this.url);
    }

    async click(buttonSelector: string) {
        await this.page.waitForSelector(buttonSelector);
        await this.page.click(buttonSelector);
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    async addValueToTextBox(textBoxSelector: string, value: string) {
        await this.page.type(textBoxSelector, value);
    }

    async readDivProperty(divSelector: string, propertyName: string) {
        return await this.page.evaluate(
            (selector, prop) => {
                const element = document.querySelector(selector);
                return element ? element[prop] : null;
            },
            divSelector,
            propertyName
        );
    }

    async close(): Promise<void> {
        await this.browser.close();
    }
}

