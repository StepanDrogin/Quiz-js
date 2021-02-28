const headElem = document.getElementById("head");
const buttonsElem = document.getElementById("buttons");
const pagesElem = document.getElementById("pages");

class Quiz
{
	constructor(type, questions, results)
	{

		this.type = type;

		this.questions = questions;

		this.results = results;


		this.score = 0;


		this.result = 0;


		this.current = 0;
	}

	Click(index)
	{

		let value = this.questions[this.current].Click(index);
		this.score += value;

		let correct = -1;


		if(value >= 1)
		{
			correct = index;
		}
		else
		{

			for(let i = 0; i < this.questions[this.current].answers.length; i++)
			{
				if(this.questions[this.current].answers[i].value >= 1)
				{
					correct = i;
					break;
				}
			}
		}

		this.Next();

		return correct;
	}


	Next()
	{
		this.current++;
		
		if(this.current >= this.questions.length) 
		{
			this.End();
		}
	}

	End()
	{
		for(let i = 0; i < this.results.length; i++)
		{
			if(this.results[i].Check(this.score))
			{
				this.result = i;
			}
		}
	}
} 


class Question 
{
	constructor(text, answers)
	{
		this.text = text; 
		this.answers = answers; 
	}

	Click(index) 
	{
		return this.answers[index].value; 
	}
}


class Answer 
{
	constructor(text, value) 
	{
		this.text = text; 
		this.value = value; 
	}
}


class Result 
{
	constructor(text, value)
	{
		this.text = text;
		this.value = value;
	}


	Check(value)
	{
		if(this.value <= value)
		{
			return true;
		}
		else 
		{
			return false;
		}
	}
}


const results = 
[
	new Result("Мда уж, знаешь ты меня довольно плохо", 0),
	new Result("Ты довольно неплохо меня знаешь", 4),
	new Result("Ты меня знаешь достаточно хорошо, мое уважение!", 7),
	new Result("Ты ответил на все 10 вопросов. Олежа зачем ты проходишь этот тест? Все и так знают, что ты за всеми следишь", 10)
];


const questions = [
    new Question("На кого я учусь?",
    [
        new Answer("Инженер", 0),
        new Answer("Историк", 0),
        new Answer("Юрист", 1),
        new Answer("Рекламщик(ответ для геев)", 0),
    ]),
    new Question("На каких вопросах я могу разъебать любого в своей игре?",
    [
        new Answer("Гачи", 1),
        new Answer("Живопись", 0),
        new Answer("История", 0),
        new Answer("Советские фильмы", 0),
    ]),
    new Question("Кого я считаю непризнанным гением и самой загадочной личностью 21 века?",
    [
        new Answer("Миша", 0),
        new Answer("Женя", 0),
        new Answer("Ваня", 1),
        new Answer("Саша", 0),
    ]),
    new Question("Чем я увлекаюсь в свободное от безделья времени?",
    [
        new Answer("Футбол", 0),
        new Answer("Качалка", 0),
        new Answer("Сериалы", 0),
        new Answer("Программирование", 1),
    ]),
    new Question("Почему Олег следит за всеми?",
    [
        new Answer("КГБшник потому что", 1),
        new Answer("Шпион потому что", 1),
        new Answer("Разведчик потому что", 1),
        new Answer("Собирает инфу на всех", 1),
    ]),
    new Question("Что я считаю душной хуйней для пидоров?",
    [
        new Answer("Книжки", 1),
        new Answer("Живопись", 0),
        new Answer("Художественная литература", 0),
        new Answer("Артхаус", 1),
    ]),
    new Question("Зачем ты проходишь этот тест?",
    [
        new Answer("Потому что меня попросил Стёпа", 0),
        new Answer("Если откажусь, он меня заебет, проще пройти", 0),
        new Answer("Конечно же по своему желание, потому что мне это очень интересно", 1),
        new Answer("Первые два варианта вместе", 0),
    ]),
    new Question("Какой фильм я считаю одним из лучших?",
    [
        new Answer("Инстерстеллар", 1),
        new Answer("Сталкер (Тарковский)", 0),
        new Answer("Самый лучший фильм", 0),
        new Answer("Звездные войны", 0),
    ]),
    new Question("Что я люблю делать в своей игре?",
    [
        new Answer("Побеждать лошков", 1),
        new Answer("Руинить чужие аппеляции", 1),
        new Answer("Проигрывать", 0),
        new Answer("Угадывать необычные вопросы", 0),
    ]),
    new Question("Ну и последний вопрос: Кого я переигрываю и уничтожаю?",
    [
        new Answer("Никиту", 1),
        new Answer("Дешевок(этот ответ и ответ выше равносильны)", 1),
        new Answer("Шавок", 0),
        new Answer("Шулеров", 0),
    ])
];


const quiz = new Quiz(1, questions, results);

Update();


function Update()
{

	if(quiz.current < quiz.questions.length) 
	{

		headElem.innerHTML = quiz.questions[quiz.current].text;


		buttonsElem.innerHTML = "";


		for(let i = 0; i < quiz.questions[quiz.current].answers.length; i++)
		{
			let btn = document.createElement("button");
			btn.className = "button";

			btn.innerHTML = quiz.questions[quiz.current].answers[i].text;

			btn.setAttribute("index", i);

			buttonsElem.appendChild(btn);
		}
		
		pagesElem.innerHTML = (quiz.current + 1) + " / " + quiz.questions.length;


		Init();
	}
	else
	{

		buttonsElem.innerHTML = "";
		headElem.innerHTML = quiz.results[quiz.result].text;
		pagesElem.innerHTML = "Очки: " + quiz.score;
	}
}

function Init()
{

	let btns = document.getElementsByClassName("button");

	for(let i = 0; i < btns.length; i++)
	{

		btns[i].addEventListener("click", function (e) { Click(e.target.getAttribute("index")); });
	}
}

function Click(index) 
{

	let correct = quiz.Click(index);


	let btns = document.getElementsByClassName("button");


	for(let i = 0; i < btns.length; i++)
	{
		btns[i].className = "button button_passive";
	}

	if(quiz.type == 1)
	{
		if(correct >= 0)
		{
			btns[correct].className = "button button_correct";
		}

		if(index != correct) 
		{
			btns[index].className = "button button_wrong";
		} 
	}
	else
	{
		btns[index].className = "button button_correct";
	}

	setTimeout(Update, 1000);
}