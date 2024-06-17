import { FormBuilder, FormGroup } from "@angular/forms";
import { LoginPageForm } from "./login.page.form";

describe('LoginPageForm', () => {

    let loginPageForm: LoginPageForm;
    let form: FormGroup;

    beforeEach(() => {
        const formBuilder = new FormBuilder();
        loginPageForm = new LoginPageForm(formBuilder);
        form = loginPageForm.createForm();
    });

    it('Debe crear un formulario de inicio de sesión vacío', () => {
        expect(form).not.toBeNull();
        expect(form.get('email')).not.toBeNull();
        expect(form.get('email').value).toEqual("");
        expect(form.get('email').valid).toBeFalsy();
        expect(form.get('password')).not.toBeNull();
        expect(form.get('password').value).toEqual("");
        expect(form.get('password').valid).toBeFalsy();
    });

    it('Debe aparecer que el correo electrónico no es válido cuando no lo es', () => {
        form.get('email').setValue('Correo electrónico inválido');
        expect(form.get('email').valid).toBeFalsy();
    });

    it('Debe aparecer que el correo electrónico es válido cuando lo es', () => {
        form.get('email').setValue('Correo electrónico válido');
        expect(form.get('email').valid).toBeTruthy();
    });

    it('El correo electrónico debe tener @', () => {
        form.get('email').setValue('Correo electrónico válido');
        form.get('password').setValue('Cualquier contraseña');
        expect(form.valid).toBeTruthy();
    });
});
