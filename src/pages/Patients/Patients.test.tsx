import { fireEvent, render, RenderResult } from '@testing-library/react';
import { PatientsStore } from '../../PatientsStore';
import Patients from './Patients';

type SutTypes = {
  sut: RenderResult;
  patientsStoreSpy: PatientsStoreSpy;
};

/**
 * @factory que retorna o SUT(system under test, que nesse caso é o componente da página Patients) e o que for necessário para rodar os testes
 */
const makeSut = (): SutTypes => {
  const patientsStoreSpy = new PatientsStoreSpy();
  const sut = render(<Patients patientsStore={patientsStoreSpy} />);

  return {
    sut,
    patientsStoreSpy,
  };
};

class PatientsStoreSpy extends PatientsStore {
  callsCount = 0;

  loadPatients = jest.fn();

  addPatient = jest.fn().mockResolvedValue({
    status: 200,
    message: 'Usuário adicionado com sucesso',
  });
}

// Helpers
type FillFieldParams = {
  sut: RenderResult;
  fieldName: string;
  value: string;
};

const fillField = ({ sut, fieldName, value }: FillFieldParams) => {
  const inputElement = sut.getByTestId(`${fieldName}-input`);
  fireEvent.input(inputElement, { target: { value } });
};

describe('Patients Page', () => {
  it('should start with initial state', () => {
    // Pegando o componente que a RTL renderizou para poder fazer os testes
    const { sut } = makeSut();

    // Obtendo os inputs do formulário e o botão de submit
    const nameInput = sut.getByTestId('name-input') as HTMLInputElement;
    const emailInput = sut.getByTestId('email-input') as HTMLInputElement;
    const submitButton = sut.getByTestId('submit-button') as HTMLButtonElement;

    // Testando os valores dos inputs e se o botão inicia desabilitado
    expect(nameInput.value).toBe('');
    expect(emailInput.value).toBe('');
    expect(submitButton.disabled).toBe(true);
    expect(submitButton.title).toBe('Preencha os campos corretamente');
  });

  it('should enable the submit button if form is valid', () => {
    // Pegando o componente que a RTL renderizou para poder fazer os testes
    const { sut } = makeSut();

    // Obtendo o botão de submit
    const submitButton = sut.getByTestId('submit-button') as HTMLButtonElement;

    // Botão deve estar desabilitado pois inputs ainda estão sem valor
    expect(submitButton.disabled).toBe(true);

    // Preenchendo os campos
    fillField({ sut, fieldName: 'name', value: 'Tiago Dias' });
    fillField({ sut, fieldName: 'email', value: 'tiago@teste.com' });

    // Botão não deve mais estar desabilitado
    expect(submitButton.disabled).toBeFalsy();
  });

  it('should clean the form when user clicks on the clear button', () => {
    const { sut } = makeSut();

    const nameValue = 'Tiago Dias';
    const emailValue = 'tiago@teste.com';

    // Preenchendo os campos
    fillField({ sut, fieldName: 'name', value: nameValue });
    fillField({ sut, fieldName: 'email', value: emailValue });

    const nameInput = sut.getByTestId('name-input') as HTMLInputElement;
    const emailInput = sut.getByTestId('email-input') as HTMLInputElement;

    expect(nameInput.value).toBe(nameValue);
    expect(emailInput.value).toBe(emailValue);

    const clearFormButton = sut.getByTestId('clear-form-button');
    fireEvent.click(clearFormButton);

    expect(nameInput.value).toBe('');
    expect(emailInput.value).toBe('');
  });

  it('should call loadPatients on page render', () => {
    const { patientsStoreSpy } = makeSut();
    expect(patientsStoreSpy.loadPatients).toHaveBeenCalled();
  });

  it('should call addPatient with the correct parameters when user clicks on the submit button', () => {
    const { sut, patientsStoreSpy } = makeSut();

    const nameValue = 'Tiago Dias';
    const emailValue = 'tiago@teste.com';

    // Preenchendo os campos
    fillField({ sut, fieldName: 'name', value: nameValue });
    fillField({ sut, fieldName: 'email', value: emailValue });

    const submitButton = sut.getByTestId('submit-button');
    fireEvent.click(submitButton);
    expect(patientsStoreSpy.addPatient).toHaveBeenCalledWith({
      name: nameValue,
      email: emailValue,
    });
  });
});
