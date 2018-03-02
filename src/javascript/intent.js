//   /$$             /$$                           /$$
//  |__/            | $$                          | $$
//   /$$ /$$$$$$$  /$$$$$$    /$$$$$$  /$$$$$$$  /$$$$$$
//  | $$| $$__  $$|_  $$_/   /$$__  $$| $$__  $$|_  $$_/
//  | $$| $$  \ $$  | $$    | $$$$$$$$| $$  \ $$  | $$
//  | $$| $$  | $$  | $$ /$$| $$_____/| $$  | $$  | $$ /$$
//  | $$| $$  | $$  |  $$$$/|  $$$$$$$| $$  | $$  |  $$$$/
//  |__/|__/  |__/   \___/   \_______/|__/  |__/   \___/
//



(function (document) {

    // ID used for the ID attribution of the intents.
    let ID = 0;

    /**
     * A helper namespace that contains a bunch of functions to
     * do various stuff.
     *
     * @private
     */
    let _ = null;

    _ = {

        /**
         * Return DOM element(s) based on a selector.
         *
         * @param  {string} selector   The selector of the element to retrieve.
         * @return {NodeList}          The retrieved element(s).
         */
        get (selector, base) {
            base = base || document;
            const found = base.querySelectorAll(selector);
            return found.length > 1 ? found : found[0];
        },

        /**
         * Create a DOM element and return it.
         *
         * @param  {string} tag           The tag name of the element to create.
         * @param  {string} [className]   The class name of the element to create.
         * @param  {string} [id]          The id of the element to create.
         * @return {Element}              The created element.
         */
        create (tag, className, id) {

            const element     = document.createElement(tag);
            element.className = className;
            element.id        = id || '';

            return element;
        },

        /**
         * Convert a string into a array based on the separator '\r\n'.
         *
         * @param {string}   string   The string to convert.
         * @return {string[}          The array resulting from the splitting of the string.
         */
        stringToArray (string) {

            if (!string || string.length === 0) return [];

            return string.replace(/\r\n/g, '\n').split('\n');
        },

        /**
         * Convert an array into a string base on the separator '\n'.
         *
         * @param {string[]} array   The array of string to convert.
         * @return {string}          The string resulting from the join of the array.
         */
        arrayToString (array) {
            return array.length > 0 ? array.join('\n') : '';
        }

    };

    /**
     * Class representing the intent modal.
     */
    class IntentModal {

        /**
         * Create an instance of InstentModal.
         *
         * @constructor
         */
        constructor () {

            /**
             * this.mode contains the current modal mode.
             * It can be setted to :
             * - show
             * - edit
             * - create
             */
            this.mode = null;

            this.DOM  = {
                body:  _.get('body'),
                modal: _.get('.c-intent-modal'),
                form:  _.get('.js-intent-modal-form'),
                actions: {
                    create: _.get('.c-intent-modal__actions-bar__create-button'),
                    edit:   _.get('.c-intent-modal__actions-bar__edit-button'),
                    cancel: _.get('.c-intent-modal__actions-bar__cancel-button'),
                    close:  _.get('.c-intent-modal__close-icon'),
                    submit: null
                }
            };

            const that = this;

            /**
             * Namespace containing all the methods and attributes related to the intent modal
             * form.
             */
            this.form = {

                /**
                 * Property telling whether yes or no, the submit can be clicked,
                 * depending on the form inputs content.
                 */
                submittable: false,

                // we get all the inputs and textarea inside this.DOM.form
                inputs: _.get('input, textarea', that.DOM.form),

                /**
                 * Return all the data of the intent modal form as an object.
                 *
                 * @memberOf this.form
                 * @return {object}
                 */
                get data () {

                    const data = {};

                    that.form.inputs.forEach((input) => {

                        data[input.name] = input.value;

                    });

                    return data;
                },

                /**
                 * Fill the intent modal form with the data given in parameter.
                 *
                 * @memberOf this.form
                 * @param {object} data   Object that contains a bunch of data.
                 */
                fill (data) {

                    for (let key in that.form.inputs) {

                        const input = that.form.inputs[key];

                        if (data.hasOwnProperty(input.name)) {

                            input.value = Array.isArray(data[input.name]) ? _.arrayToString(data[input.name]) : data[input.name];

                        }
                    }

                },

                /**
                 * Put all the intent modal form inputs in readonly mode.
                 */
                disable () {

                    that.form.inputs.forEach((input) => {
                        input.readOnly = true;
                    });
                },

                /**
                 * Remove all the intent modal form inputs readonly mode.
                 */
                enable () {

                    that.form.inputs.forEach((input) => {
                        input.readOnly = false;
                    });
                }


            };

            // we launch all the listeners.
            this.listeners.all();
        }

        get listeners () {

            let listenFor = null;

            listenFor = {

                all: () => {
                    listenFor.executionOf.close();
                    listenFor.executionOf.changes();
                },

                displayOf: {},

                executionOf: {

                    /**
                     * Initialize an handler that closes the modal when the the close icon
                     * or the cancel button of the intent modal is clicked.
                     */
                    close: () => {

                        const handler = (event) => {
                            event.preventDefault();
                            this.close();
                        };

                        this.DOM.actions.close.addEventListener('click', handler);
                        this.DOM.actions.cancel.addEventListener('click', handler);

                    },

                    /**
                     * Initialize an handler that verify that every fields is correct every time,
                     * an input is changed. If one or more fields are incorrect the handler disable
                     * that submit button to prevent the form validation.
                     */
                    changes: () => {

                        const inputs = _.get('input, textarea', this.DOM.form);

                        const handler = () => {

                            let submittable = true;

                            inputs.forEach((input) => {
                                submittable = submittable && (input.value !== '');
                            });

                            if (this.DOM.actions.submit !== null)
                                this.DOM.actions.submit.disabled = !submittable;

                            this.form.submittable  = submittable;
                        };

                        inputs.forEach((input) => {
                            input.addEventListener('input', handler.bind(this, input));
                        });

                    },

                }

            };

            return listenFor;
        }

        /**
         * Open the intent modal with a given mode.
         *
         * @param {string} mode   The mode with which open the modal.
         */
        open (mode) {

            this.DOM.body.classList.add('o-body--opened-modal');
            this.DOM.modal.classList.add(`c-intent-modal--${mode}-mode`);

            // todo : explain this piece of code
            if (this.DOM.actions[mode]) {

                this.DOM.actions.submit = this.DOM.actions[mode];
                this.DOM.actions.submit.classList.add('js-intent-modal-form__submit-button');
            }

            this.mode = mode;
        }

        /**
         * Close the modal and remove all the now useless listen handler.
         *
         * @param {function} handler   The handler to remove.
         */
        close (handler) {

            this.DOM.body.classList.remove('o-body--opened-modal');
            this.DOM.modal.classList.remove(`c-intent-modal--${this.mode}-mode`);

            if (this.DOM.actions[this.mode]) {

                this.DOM.actions.submit.classList.remove('js-intent-modal-form__submit-button');

                if (handler) this.DOM.actions.submit.removeEventListener('click', handler);

                this.DOM.actions.submit = null;
            }

            /**
             * When we close the modal, we reset and re-enable all the intent form inputs.
             * We also disable any submit button with 'this.form.submittable = false'.
             * And we reset the mode with 'this.mode = null'.
             */
            this.DOM.form.reset();
            this.form.enable();
            this.form.submittable = false;

            this.mode = null;
        }

    }

    /**
     * Class representing an intent object.
     *
     */
    class Intent {

        /**
         * Create an Intent instance.
         *
         * @constructor
         * @param {object}       body     An object containing the data of the intent.
         * @param {IntentSystem} system   The IntentSystem instance handling all this stuff.
         */
        constructor (body, system) {

            this.ID     = ID++;
            this.body   = body || {};
            this.DOM    = this.DOM();
            this.system = system;
            this.modal  = this.system.modal;

            this.lastUpdated = new Date();

            if (!this.system) throw new Error('Missing intent system.');

            // we launch all the listeners.
            this.listeners.all();


            setInterval(() => {
                this.updateDOMLastUpdate();
            }, 1000);
        }

        /**
         * Getter that return the title of the intent.
         *
         * @type {string}
         */
        get title () {
            return this.body.title;
        }

        /**
         * Getter that return the expressions associated with the intent.
         *
         * @type {string[]}
         */
        get expressions () {
            return this.body.expressions;
        }

        /**
         * Getter that return the answer associated with the intent.
         *
         * @type {string}
         */
        get answer () {
            return this.body.answer;
        }

        /**
         * Return a verbose value indicating the time elapsed since the last intent update.
         *
         * NB : see https://stackoverflow.com/questions/3177836/how-to-format-time-since-xxx-e-g-4-minutes-ago-similar-to-stack-exchange-site
         * @return {string}
         */
        timeSinceUpdate () {

            const seconds  = Math.floor((new Date() - this.lastUpdated) / 1000);
            let   interval = Math.floor(seconds / 31536000);

            if (interval > 1) return interval + ' years';

            interval = Math.floor(seconds / 2592000);

            if (interval > 1) return interval + ' months';

            interval = Math.floor(seconds / 86400);

            if (interval > 1) return interval + ' days';

            interval = Math.floor(seconds / 3600);

            if (interval > 1) return interval + ' hours';

            interval = Math.floor(seconds / 60);

            if (interval > 1) return interval + ' minutes';

            return 'seconds';

        }

        /**
         * Update the DOM with the current title.
         */
        updateDOMTitle () {
            this.DOM.title.innerHTML = `<a href='#'>${this.body.title}</a>`;
        }

        /**
         * Update the DOM updated field.
         */
        updateDOMLastUpdate () {
            this.DOM.updated.innerHTML = `${this.timeSinceUpdate()} ago`;
        }


        /**
         * Getter that return an object containing a bunch
         * of listener functions.
         *
         * NB : This could be in the constructor, but I find it more elegant
         * to put it here.
         *
         * @type {Object}
         */
        get listeners () {

            let listenFor = null;

            listenFor = {

                all: () => {

                    listenFor.displayOf.form.edit();
                    listenFor.displayOf.form.delete();
                    listenFor.displayOf.form.show();

                    listenFor.executionOf.deletion.cancel();
                    listenFor.executionOf.deletion.confirm();
                },

                displayOf: {

                    form: {

                        edit: () => {

                            this.DOM.actions.edit.addEventListener('click', () => {

                                this.modal.open('edit');
                                this.modal.form.fill(this.body);

                                listenFor.executionOf.edit();
                            });

                        },

                        delete: () => {

                            if (!this.DOM.actions.delete) throw new Error('Missing delete icon DOM element.');

                            this.DOM.actions.delete.addEventListener('click', () => {

                                this.DOM.card.classList.add('c-card--delete-flag');
                                listenFor.executionOf.deletion.shown = true;
                            });

                        },

                        show: () => {

                            this.DOM.title.addEventListener('click', (event) => {

                                event.preventDefault();

                                this.modal.open('view');
                                this.modal.form.disable();
                                this.modal.form.fill(this.body);
                            });

                        }


                    }

                },

                executionOf: {

                    deletion: {

                        shown: false,

                        cancel: () => {

                            if (!this.DOM.confirmation.cancel) throw new Error('Missing cancel deletion button.');

                            this.DOM.confirmation.cancel.addEventListener('click', () => {
                                this.DOM.card.classList.remove('c-card--delete-flag');
                                listenFor.executionOf.deletion.shown = false;
                            });

                        },

                        confirm: () => {

                            if (!this.DOM.confirmation.confirm) throw new Error('Missing confirm deletion button.');

                            this.DOM.confirmation.confirm.addEventListener('click', () => {
                                if (listenFor.executionOf.deletion.shown) {
                                    this.system.remove(this.ID);
                                }
                            });

                        }

                    },

                    edit: () => {

                        const handler = (event) => {

                            event.preventDefault();

                            if (!this.modal.form.submittable) return;

                            const formData = this.modal.form.data;

                            formData.expressions = _.stringToArray(formData.expressions);

                            this.body = formData;

                            this.updateDOMTitle();
                            this.lastUpdated = new Date();

                            this.modal.close(handler);

                        };

                        this.modal.DOM.actions.edit.addEventListener('click', handler);

                    }

                }

            };

            return listenFor;
        }

        /**
         * Generate the DOM of the card
         *
         * @return {object}   The DOM card object.
         */
        DOM () {

            const svgs = {

                edit: `
                <svg class="c-card__actions__edit" role="button" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
            `,

                delete: `
                <svg class="c-card__actions__delete" role="button" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
            `

            };

            const card = _.create('article', 'c-card');

            card.innerHTML = `

            <h1 class="c-card__title"><a href="#">${this.body.title}</a></h1>

            <aside class="c-card__meta">

                <div class="c-card__updated">
                    <span class="c-card__updated__label">Last Updated</span>
                    <span class="c-card__updated__time js-updated-time">seconds ago</span>
                </div>

                <div class="c-card__actions" role="navigation">

                    ${svgs.edit}

                    ${svgs.delete}

                </div>
            </aside>

            <aside class="c-card__warning">

                <h1 class="c-card__warning__title">You are about to delete this intent. Are you sure?</h1>

                <div class="c-card__warning__actions">
                    <button class="c-card__warning__actions__confirm c-button c-button--red">Yes I am</button>
                    <button class="c-card__warning__actions__cancel c-button c-button--purple">No I'm not</button>
                </div>
            </aside>

        `;

            /**
             * We keep a track of all the sub-elements that needs to be manipulate
             * in the future.
             */
            return {
                card: card,

                title:   _.get('.c-card__title', card),
                updated: _.get('.c-card__updated__time', card),

                actions: {
                    edit:   _.get('svg.c-card__actions__edit', card),
                    delete: _.get('svg.c-card__actions__delete', card)
                },

                confirmation: {
                    confirm: _.get('.c-card__warning__actions__confirm', card),
                    cancel:  _.get('.c-card__warning__actions__cancel', card)
                }
            };
        }

    }

    /**
     * Class representing the intent management system.
     */
    class IntentSystem {

        /**
         * @constructor
         *
         * @param {string} selector   The container selector for the intent system.
         */
        constructor (selector) {

            this.intents = {};

            this.modal = new IntentModal();
            this.DOM = {
                body:      _.get('body'),
                container: _.get(selector)
            };

            this.listeners.all();
        }

        /**
         * Getter that return an object containing a bunch
         * of listener functions.
         *
         * NB : This could be in the constructor, but I find it more elegant
         * to put it here.
         *
         * @type {Object}
         */
        get listeners () {

            let listenFor = null;

            listenFor = {

                all: () => {
                    listenFor.displayOf.form();
                    listenFor.executionOf.create();
                },

                displayOf: {

                    form: () => {

                        const newIntentCardButton = _.get('.c-new-intent-button');

                        if (!newIntentCardButton) throw new Error('Missing new intent card button.');

                        newIntentCardButton.addEventListener('click', () => {
                            this.modal.open('create');
                        });

                    }

                },

                executionOf: {

                    create: () => {

                        this.modal.DOM.actions.create.addEventListener('click', () => {

                            event.preventDefault();

                            if (!this.modal.form.submittable) return;

                            const formData = this.modal.form.data;

                            formData.expressions = _.stringToArray(formData.expressions);

                            this.add(new Intent(formData, this));

                            this.modal.close();

                        });

                    }

                }

            };

            return listenFor;

        }

        /**
         * Add a new intent to the intents list.
         *
         * @param {Intent} intent   The new intent to add to the intents list.
         */
        add (intent) {

            // We use js-anchor to add element before the new intent button more easily.
            const anchor = _.get('.js-anchor', this.DOM.container);

            if (intent && intent.hasOwnProperty('ID')) {
                this.intents[intent.ID] = intent;
            } else {
                throw new Error('Insertion failed.');
            }

            this.DOM.container.insertBefore(intent.DOM.card, anchor);

        }

        /**
         * Remove the intent designated by the given id.
         *
         * @param {number} id   The id of the intent to delete.
         */
        remove (id) {

            const intentToRemove = this.intents[id].DOM.card;

            delete this.intents[id];

            intentToRemove.parentNode.removeChild(intentToRemove);
        }

    }


    new IntentSystem('.o-section');

})(document);
