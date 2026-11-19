
var Items = new Map();


var DraggedKey = "";


var DragOffsetX = 0;
var DragOffsetY = 0;


var TargetColor = "#bbbbbb";

var TextInput = document.getElementById("TextInput");
var ParseButton = document.getElementById("ParseButton");
var SourceBlock = document.getElementById("SourceBlock");
var TargetBlock = document.getElementById("TargetBlock");
var ResultBlock = document.getElementById("ResultBlock");


TargetBlock.style.position = "relative";
TargetBlock.style.height = "200px";

function IsNumber(Text) {
    if (Text.length === 0) {
        return false;
    }
    for (var I = 0; I < Text.length; I++) {
        var Symbol = Text.charAt(I);
        if (Symbol < "0" || Symbol > "9") {
            return false;
        }
    }
    return true;
}

function IsUpperCaseWord(Word) {
    var FirstLetter = Word.charAt(0);
    if (FirstLetter === FirstLetter.toUpperCase() && FirstLetter !== FirstLetter.toLowerCase()) {
        return true;
    }
    return false;
}

function CompareWords(WordA, WordB) {
    return WordA.localeCompare(WordB, "ru");
}

function CompareNumbers(NumberA, NumberB) {
    return NumberA - NumberB;
}

function GetRandomColor() {
    var Hue = Math.floor(Math.random() * 360);
    return "hsl(" + Hue + ", 80%, 70%)";
}

function CreateItem(Key, Text) {
    var Item = {};
    Item.Text = Text;
    Item.Color = GetRandomColor();
    Item.Element = CreateElement(Key, Item);
    return Item;
}

function BuildItems(Text) {
    var Parts = Text.split("-");
    var LowerWords = [];
    var UpperWords = [];
    var Numbers = [];

    for (var I = 0; I < Parts.length; I++) {
        var Part = Parts[I].trim();

        if (Part === "") {
            continue;
        }

        if (IsNumber(Part)) {
            Numbers.push(Number(Part));
        } else if (IsUpperCaseWord(Part)) {
            UpperWords.push(Part);
        } else {
            LowerWords.push(Part);
        }
    }

    LowerWords.sort(CompareWords);
    UpperWords.sort(CompareWords);
    Numbers.sort(CompareNumbers);

    var Result = new Map();

    for (var A = 0; A < LowerWords.length; A++) {
        var KeyA = "a" + (A + 1);
        Result.set(KeyA, CreateItem(KeyA, LowerWords[A]));
    }

    for (var B = 0; B < UpperWords.length; B++) {
        var KeyB = "b" + (B + 1);
        Result.set(KeyB, CreateItem(KeyB, UpperWords[B]));
    }

    for (var N = 0; N < Numbers.length; N++) {
        var KeyN = "n" + (N + 1);
        Result.set(KeyN, CreateItem(KeyN, String(Numbers[N])));
    }

    return Result;
}

function CreateElement(Key, Item) {
    var Element = document.createElement("div");
    Element.className = "WordItem";
    Element.textContent = Key + " " + Item.Text;
    Element.style.backgroundColor = Item.Color;
    Element.draggable = true;
    Element.setAttribute("data-key", Key);

    Element.addEventListener("dragstart", function (Event) {
        DraggedKey = Key;
        Event.dataTransfer.setData("text", Key);

        var Rect = Element.getBoundingClientRect();
        DragOffsetX = Event.clientX - Rect.left;
        DragOffsetY = Event.clientY - Rect.top;
    });

    Element.addEventListener("click", function () {
        if (Element.parentElement === TargetBlock) {
            AddWordToResult(Item);
        }
    });

    return Element;
}

function RenderAll() {
    SourceBlock.innerHTML = "";
    TargetBlock.innerHTML = "";

    Items.forEach(function (Item) {
        SourceBlock.appendChild(Item.Element);
    });
}

function FindItemByKey(Key) {
    if (Items.has(Key)) {
        return Items.get(Key);
    }
    return null;
}

function AddWordToResult(Item) {
    var WordElement = document.createElement("span");
    WordElement.textContent = Item.Text + " ";
    WordElement.style.color = Item.Color;
    ResultBlock.appendChild(WordElement);
}

function OnParseClick() {
    Items = BuildItems(TextInput.value);
    ResultBlock.innerHTML = "";
    RenderAll();
}

function GetSourceBeforeElement(Key) {
    var Keys = Array.from(Items.keys());
    var StartIndex = Keys.indexOf(Key) + 1;

    for (var I = StartIndex; I < Keys.length; I++) {
        var NextItem = Items.get(Keys[I]);

        if (NextItem.Element.parentElement === SourceBlock) {
            return NextItem.Element;
        }
    }

    return null;
}

function OnTargetDrop(Event) {
    Event.preventDefault();

    var Item = FindItemByKey(DraggedKey);
    if (Item === null) {
        return;
    }

    TargetBlock.appendChild(Item.Element);
    Item.Element.style.position = "absolute";
    Item.Element.style.backgroundColor = TargetColor;

    var BlockRect = TargetBlock.getBoundingClientRect();
    var Left = Event.clientX - DragOffsetX - BlockRect.left - TargetBlock.clientLeft;
    var Top = Event.clientY - DragOffsetY - BlockRect.top - TargetBlock.clientTop;

    var MaxLeft = TargetBlock.clientWidth - Item.Element.offsetWidth;
    var MaxTop = TargetBlock.clientHeight - Item.Element.offsetHeight;

    if (Left > MaxLeft) {
        Left = MaxLeft;
    }
    if (Left < 0) {
        Left = 0;
    }
    if (Top > MaxTop) {
        Top = MaxTop;
    }
    if (Top < 0) {
        Top = 0;
    }

    Item.Element.style.left = Left + "px";
    Item.Element.style.top = Top + "px";
}

function OnSourceDrop(Event) {
    Event.preventDefault();

    var Item = FindItemByKey(DraggedKey);
    if (Item === null) {
        return;
    }

    if (Item.Element.parentElement === TargetBlock) {
        var BeforeElement = GetSourceBeforeElement(DraggedKey);

        Item.Element.style.position = "";
        Item.Element.style.left = "";
        Item.Element.style.top = "";
        Item.Element.style.backgroundColor = Item.Color;

        SourceBlock.insertBefore(Item.Element, BeforeElement);
    }
}

function OnDragOver(Event) {
    Event.preventDefault();
}

ParseButton.addEventListener("click", OnParseClick);
TargetBlock.addEventListener("dragover", OnDragOver);
TargetBlock.addEventListener("drop", OnTargetDrop);
SourceBlock.addEventListener("dragover", OnDragOver);
SourceBlock.addEventListener("drop", OnSourceDrop);
