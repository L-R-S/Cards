//	Cards − save and show invoicing details, business cards, id's etc
//
//	Copyright (C) 2014  Lucjan R. Szreter
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see http://www.gnu.org/licenses/.
//
//	https://www.gnu.org/licenses/gpl.html

//if (window.devicePixelRatio == 1.5) {
//  alert("This is a high-density screen");
//} else if (window.devicePixelRatio == 0.75) {
//  alert("This is a low-density screen");
//}

"use strict";
//var l__ = {};
var ustawienia = {};
var ustawienia_grupy = [];
//var cards_jezyk_systemu = 'pl'; //utworzyc -> ustawienia.lang
var fileWriter = null;
var fileSystem = null;
var reader_ustawienia = null;
var isPhoneGapReady = false;
var plik_nazwa = null;
var plik_tresc = null;
var pierwsze_uruchomienie = 1;
var folder_wizytowki = null;
var folder_wizytowki_foto = null;
var folder_programu = null;
var plik_ustawien_tresc = null;
var plik_ustawien = null;
var przycisk_zamknij = "<div class=\"zamknij_okno\" id=\"przycisk_zamknij\"><img src=\"img/cards_zamknij.svg\" alt=\"*\"></div>";
var zdjecie = ''; //URI zdjęcia pobieranego z aparatu lub galerii
var lista_wizytowek_lista = [];
var lista_wizytowek_biezaca = -1;
//var nazwa_pliku_biezacej_wizytowki;
var wyswietlaj_menu_wizytowki = 0;
var wyswietlaj_menu_wizytowki_licznik = null;
var wizytowka_dane = {};
var x_down = null;
var y_down = null;
var edycja = 0;

window.onload = init;

//------------funkcje podstawowe
function init() {
	document.addEventListener("deviceready", onDeviceReady, fail);
}
function fail(error) {
	alert(error.code);
}
function onDeviceReady() {

document.getElementById('debug').innerHTML = "Pixelratio: " + window.devicePixelRatio;


	isPhoneGapReady = true;

//odczyt jezyka i doladowanie pliku jezyka
	navigator.globalization.getPreferredLanguage(odczytaj_jezyk_systemu, fail);

	odczytaj_folder_programu();

//ustawienie dotyku
	document.getElementById('logo_glowne').addEventListener('touchstart', lista_wizytowek_pokaz, false);

	document.getElementById('menu_dodaj_wiz_z_klaw').addEventListener('touchstart', menu_dodaj_wiz_z_klawiatury, false);
	document.getElementById('menu_dodaj_wiz_z_aparatu').addEventListener('touchstart', menu_dodaj_wiz_z_aparatu, false);
	document.getElementById('menu_dodaj_wiz_z_galerii').addEventListener('touchstart', menu_dodaj_wiz_z_galerii, false);

//	document.getElementById('menu_dodaj_wiz').addEventListener('touchstart', menu_dodaj_wiz_sposob_pokaz, false);
	document.getElementById('menu_wizytowka_lista').addEventListener('touchstart', function (evl) {wyswietl_wizytowke('');}, false);
	document.getElementById('menu_udostepnij').addEventListener('touchstart', menu_udostepnij_program, false);
	document.getElementById('menu_pomoc').addEventListener('touchstart', pomoc_pokaz, false);
	document.getElementById('menu_info').addEventListener('touchstart', o_programie_pokaz, false);

	document.getElementById('dodaj_wiz_z_klawiatury_cofnij').addEventListener('touchstart', zamknij_wszystkie_okna, false);
	document.getElementById('dodaj_wiz_z_klawiatury_plus').addEventListener('touchstart', wizytowka_zapisz, false);

	document.addEventListener("backbutton", nacisnieto_powrot, false);
	document.addEventListener("menubutton", nacisnieto_menu, false);

// tylko blackberry
//	document.addEventListener("volumedownbutton", nacisnieto_vol_down, false);
//	document.addEventListener("volumeupbutton", nacisnieto_vol_up, false);
}
function odczytaj_jezyk_systemu(language) {
	var jezyk = language.value.substring(0,2);

	ustawienia.lang = jezyk;

//	obowiazkowy PL jest wczytywany z naglowka HTML
//	if(jezyk == 'en' || jezyk == '..........') {
	if(jezyk === 'en' ) {
//		document.write('<script src="lang/' + jezyk + '/lang.js"></script>');
//		script.load("lang/" + jezyk + "/lang.js");
		var sciezka = "lang/" + jezyk + "/lang.js";
		var head = document.getElementsByTagName('head')[0];
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = sciezka;
		head.appendChild(script);
	}
}

function zamknij_okno(okno) {
	document.getElementById(okno).style.display = 'none';
	document.getElementById('app').style.display = 'block';

}
function zamknij_wszystkie_okna(zostaw_sterowanie) {
	edycja = 0;
	zdjecie = '';
	document.getElementById('app').style.display = 'block';

//	document.getElementById('menu_dodaj_wiz_sposob').style.display = 'none';
	document.getElementById('menu_dodaj_wiz_z_klawiatury').style.display = 'none';
	document.getElementById('lista_wizytowek_div').style.display = 'none';
	document.getElementById('okno_wizytowki').style.display = 'none';
	document.getElementById('okno_pobierania_zdjecia').style.display = 'none';
	document.getElementById('okno_mg').style.display = 'none';
	document.getElementById('okno_pomoc').style.display = 'none';
	document.getElementById('okno_o_programie').style.display = 'none';
	document.getElementById('okno_ustawienia').style.display = 'none';

	if(zostaw_sterowanie !== 1) {
		document.getElementById('wizytowka_sterowanie').style.display = 'none'; // nie wlaczac blokuje program bo nie istnieje w niektorych kontekstach
	}
}
function utworz_nazwe_pliku(rozszerzenie) {
	var data = new Date();
	return data.getFullYear() + '-' + data.getMonth()  + '-' + data.getDate() + '-' + data.getHours() + '-' + data.getMinutes() + '-' + data.getSeconds() + '-' + data.getMilliseconds() + rozszerzenie;
}
function odczytaj_folder_programu() {
	window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, otworz_folder_wizytowki, fail);
}
function otworz_folder_wizytowki(folder) {
	folder_programu = folder;
	folder.getDirectory("wizytowki", {create: true, exclusive: false}, zachowaj_folder_wizytowki, fail);
	folder.getDirectory("wizytowki_foto", {create: true, exclusive: false}, zachowaj_folder_wizytowki_foto, fail);
}
function zachowaj_folder_wizytowki(folder) {
	folder_wizytowki = folder;
	odczytaj_ustawienia();
	lista_wizytowek();
}
function zachowaj_folder_wizytowki_foto(folder) {
	folder_wizytowki_foto = folder;
}
//------------funkcje głowne

//function menu_dodaj_wiz_sposob_pokaz() {
//	zamknij_wszystkie_okna();
//	document.getElementById('app').style.display = 'none';
//	document.getElementById('menu_dodaj_wiz_sposob').style.display = 'block';
//}
function menu_dodaj_wiz_z_klawiatury() {
	zamknij_wszystkie_okna();
	document.getElementById('menu_dodaj_wiz_z_klawiatury').style.display = 'block';
	wizytowka_dodaj_wyzeruj_pola();
	plik_nazwa = '';
}
function wizytowka_zapisz() {
	var formularz = document.getElementById('f1');
	var i = 0;
	var parametry = '';

	if (edycja == 0 ) {
		if(plik_nazwa != '') {
			parametry = "typ=foto\nplik=" + plik_nazwa + "\ntlo=\n\grupa=\nkolejnosc=\n";
		}
		else {
			plik_nazwa = utworz_nazwe_pliku('.card');
			parametry = "typ=text\nplik=\ntlo=\n\grupa=\nkolejnosc=\n";

		}
	}
	else {
		parametry = "typ=" + wizytowka_dane.typ + "\n"
			+ "plik=" + wizytowka_dane.plik + "\n"
			+ "tlo=" + wizytowka_dane.tlo + "\n"
			+ "grupa=" + wizytowka_dane.grupa + "\n"
			+ "kolejnosc=" + wizytowka_dane.kolejnosc + "\n"
			;
	}

	edycja = 0;

	if(formularz) {
		var ilosc_pol = formularz.elements.length;
		for(i = 0; i < ilosc_pol; i++ ) {
			parametry += formularz.elements[i].name + '=' + formularz.elements[i].value + "\n";
		}
	}
	else {
		alert('ERROR - NO FORM');
	}
	plik_tresc = parametry;
	wizytowka_zapisz_utworz_plik();
}
function wizytowka_zapisz_utworz_plik() {
	folder_wizytowki.getFile(plik_nazwa, {create: true, exclusive: false}, wizytowka_zapisz_fileentry, fail);
}
function wizytowka_zapisz_fileentry(fileEntry) {
	fileEntry.createWriter(wizytowka_zapisz_FileWriter, fail);
}
function wizytowka_zapisz_FileWriter(writer) {
	writer.onwriteend = function(evt) {
//alert ("Zapisano");
							zamknij_wszystkie_okna();
							lista_wizytowek_lista[lista_wizytowek_lista.length] = plik_nazwa;
							wyswietl_wizytowke(plik_nazwa);
						};
	writer.onerror = 'fail';
	writer.write(plik_tresc);
}
function lista_wizytowek() {
	var directoryReader = folder_wizytowki.createReader();
	directoryReader.readEntries(lista_wizytowek_utworz, fail);
}
function lista_wizytowek_utworz(lista_plikow_wizytowek) {
	var i;
	var lista = przycisk_zamknij;
	lista_wizytowek_lista = [];
    for (i=0; i < lista_plikow_wizytowek.length; i++) {
		lista += "<div class=\"wizytowka_lista_pozycja\" onclick=\"wyswietl_wizytowke('" + lista_plikow_wizytowek[i].name + "');\">";

		if ( lista_plikow_wizytowek[i].name == ustawienia.domyslna ) {
			lista += '</b>' + lista_plikow_wizytowek[i].name + '</b>';
		}
		else {
			lista += lista_plikow_wizytowek[i].name
		}
		lista += "</div>";
		lista_wizytowek_lista[i] = lista_plikow_wizytowek[i].name;
    }

//	dodanie wizytowki firmowej
	lista_wizytowek_lista[i] = 'system.cards';

	document.getElementById('lista_wizytowek_div').innerHTML = lista;
}
function lista_wizytowek_pokaz() {
	document.getElementById('przycisk_zamknij').addEventListener('touchstart', zamknij_wszystkie_okna, false);
	document.getElementById('lista_wizytowek_div').style.display = 'block';
}
//====================USTAWIENIA
function odczytaj_ustawienia() {
	folder_programu.getFile("settings.ini", {create: true, exclusive: false}, odczytaj_ustawienia_uchwyt, fail);
}
function odczytaj_ustawienia_uchwyt(plik) {
	plik_ustawien = plik;
	plik_ustawien.file(odczytaj_ustawienia_tresc, fail);
}
function odczytaj_ustawienia_tresc(plik) {
	reader_ustawienia = new FileReader();
	reader_ustawienia.onerror = fail;
	reader_ustawienia.onloadend = function(evt) {
//									alert ("Odczyt ustawien A\n" + evt.target.result + "\n|\n" + reader_ustawienia.error.code);
//									alert ("Odczyt ustawien A\n" + "\n|\n");
									odczytaj_ustawienia_wczytaj(evt.target.result);
									}
	reader_ustawienia.readAsText(plik);
}
function odczytaj_ustawienia_wczytaj(ustawienia_tresc) {
	var ustawienie_ini_nazwa;
	var ustawienie_ini_wartosc;
	var ustawienie_separator_pozycja;

	plik_ustawien_tresc = ustawienia_tresc;

	if(ustawienia_tresc == "") {
		pierwsze_uruchomienie = 1;
		ustawienia.domyslna = '';
		ustawienia_grupy[0] = l__.grupa0;
		ustawienia_grupy[1] = l__.grupa1;
		ustawienia_grupy[2] = l__.grupa2;
		ustawienia_grupy[3] = l__.grupa3;
		ustawienia_grupy[4] = l__.grupa4;

		ustawienia_zapisz();
//		pierwsze uruchomienie wiec dodanie nowej wizytowki - okno wyboru typu wizytóœki? albo nic nie robić? jakiś tutorial?

	}
	else {
		pierwsze_uruchomienie = 0;
		ustawienia_grupy = [];
//		odczytanie ustawien
		var lista_ustawien = plik_ustawien_tresc.split("\n");
		var lista_ustawien_ilosc = lista_ustawien.length;
		for(var x = 0; x < lista_ustawien_ilosc; ++x) {
			ustawienie_separator_pozycja = lista_ustawien[x].indexOf("=");
			ustawienie_ini_nazwa = lista_ustawien[x].substr(0, ustawienie_separator_pozycja);
			ustawienie_ini_wartosc = lista_ustawien[x].substr(ustawienie_separator_pozycja + 1);

			switch (ustawienie_ini_nazwa) {
				case 'grupa':
					ustawienia_grupy.push(ustawienie_ini_wartosc);
					break;
				case 'domyslna':
					ustawienia.domyslna = ustawienie_ini_wartosc;
			}
		}
		ustawienia_grupy.sort();

		wyswietl_wizytowke('domyslna');
	}
}

function ustawienia_zapisz() {
        plik_ustawien.createWriter(ustawienia_zapisz_writer, fail);
}

function ustawienia_zapisz_writer(writer) {
	var plik_ustawien_tresc_do_zapisu = ustawienia_utworz_tresc();
	writer.onerror = 'fail';
	writer.onwriteend = function(evt) {
//							alert (l__.zapisano_ustawienia);
						};
	writer.write(plik_ustawien_tresc_do_zapisu);
}

function ustawienia_utworz_tresc() {
	var tresc = 'domyslna=' + ustawienia.domyslna + "\n";
	var ilosc_grup = ustawienia_grupy.length;
	for(var x = 0; x < ilosc_grup; ++x) {
		tresc += "grupy=" + ustawienia_grupy[x] + "\n";
	}
	return tresc;
}
//==============wyswietl wizytowke
function wyswietl_wizytowke(nazwa_pliku_wizytowki) {
	if ( nazwa_pliku_wizytowki != 'undefined') {
		plik_nazwa = nazwa_pliku_wizytowki;
	}
	else {
		plik_nazwa = '';
	}

	if(plik_nazwa == 'domyslna') {
		plik_nazwa = ustawienia.domyslna;
		if(plik_nazwa == '') {
			plik_nazwa = 'system.cards';
		}
	}

	if(plik_nazwa == '') {
		var directoryReader = folder_wizytowki.createReader();
		directoryReader.readEntries(wyswietl_wizytowke_wyswietl_pierwsza, fail);
	}
	else {
		if(plik_nazwa == 'system.cards') {
			wizytowka_odczytaj_tresc_systemowa();
		}
		else {
			wyswietl_wizytowke_odczytaj_plik(plik_nazwa);
		}
	}
}

function wyswietl_wizytowke_wyswietl_pierwsza(lista_plikow_wizytowek) {
	var ilosc_wizytowek = lista_plikow_wizytowek.length;

	if (ilosc_wizytowek > 0) {
		var nazwa_pliku_wizytowki = lista_plikow_wizytowek[0].name;
		plik_nazwa = nazwa_pliku_wizytowki;
		lista_wizytowek_biezaca = 0;
		wyswietl_wizytowke_odczytaj_plik(nazwa_pliku_wizytowki);
	}
	else {
		alert(l_brak_wizytowek);
    }
}

function wyswietl_wizytowke_odczytaj_plik(nazwa_pliku_wizytowki) {

	folder_wizytowki.getFile(nazwa_pliku_wizytowki, {create: false, exclusive: false}, wyswietl_wizytowke_fileentry, wyswietl_wizytowke_blad);
}
function wyswietl_wizytowke_blad() {
	alert (l__.nie_mozna_wyswietlic);
}
function wyswietl_wizytowke_fileentry(wizytowka_getfile){

	wizytowka_getfile.file(wyswietl_wizytowke_gotfile, wyswietl_wizytowke_blad);
}
function wyswietl_wizytowke_gotfile(wizytowka_plik) {

	var reader_wizytowka = new FileReader();
	reader_wizytowka.onerror = wyswietl_wizytowke_blad;
	reader_wizytowka.onloadend = function(evt) {
									wyswietl_wizytowke_odczytaj_tresc(evt.target.result);
									}
	reader_wizytowka.readAsText(wizytowka_plik);
}
function wyswietl_wizytowke_odczytaj_tresc(wizytowka_tresc_z_pliku) {

	var wizytowka_separator_pozycja;
	var wizytowka_ini_nazwa;
	var wizytowka_ini_wartosc;
	var wizytowka_html = '';
	var wizytowka_html_sterowanie = '';

	lista_wizytowek_biezaca = ustal_id_wizytowki_po_nazwie(plik_nazwa);

	var lista_pozycji = wizytowka_tresc_z_pliku.split("\n");
	var lista_pozycji_ilosc = lista_pozycji.length;
	for(var x = 0; x < lista_pozycji_ilosc; ++x) {
		wizytowka_separator_pozycja = lista_pozycji[x].indexOf("=");
		wizytowka_ini_nazwa = lista_pozycji[x].substr(0, wizytowka_separator_pozycja);
		wizytowka_ini_wartosc = lista_pozycji[x].substr(wizytowka_separator_pozycja + 1);

		wizytowka_dane[wizytowka_ini_nazwa] = wizytowka_ini_wartosc
	}

	if (wizytowka_dane.typ == 'html') {
		wizytowka_html += wizytowka_dane.html;
	}
	else if ( wizytowka_dane.plik == '' ) {

		var wizytowka_html_szablon = "<div id=\"wizytowka_company_name\">[%f1_company_name%]</div>"
			+ "<div id=\"wizytowka_imie_nazwisko\">[%f1_imie_nazwisko%]</div>"
			+ "<div id=\"wizytowka_stanowisko\">[%f1_stanowisko%]</div>"
			+ "<table><tr>"
			+ "<td>"
			+ "<p id=\"wizytowka_adres_1\">[%f1_adres_1%]</p>"
			+ "<p id=\"wizytowka_adres_2\">[%f1_adres_2%]</p>"
			+ "<p id=\"wizytowka_adres_3\">[%f1_adres_3%]</p>"
			+ "<p id=\"wizytowka_tel\">[%f1_tel%]</p>"
			+ "<p id=\"wizytowka_telkom\">[%f1_telkom%]</p>"
			+ "<p id=\"wizytowka_email\">[%f1_email%]</p>"
			+ "<p id=\"wizytowka_www\">[%f1_www%]</p>"
			+ "<p id=\"wizytowka_komunikator\">[%f1_komunikator%]</p>"
			+ "</td><td>"
			+ "<p id=\"wizytowka_id1\">[%f1_id1%]</p>"
			+ "<p id=\"wizytowka_id2\">[%f1_id2%]</p>"
			+ "<p id=\"wizytowka_samochod\">[%f1_samochod%]</p>"
			+ "</tr><tr><td colspan=\"2\""
			+ "<p id=\"wizytowka_konto_bankowe\">[%f1_konto_bankowe%]</p>"
			+ "</tr></table>"
		;

//podmiana tresci w szblonie
		wizytowka_html += wizytowka_html_szablon;

		if (typeof wizytowka_dane.f1_company_name != 'undefined') {
			wizytowka_html = wizytowka_html.replace("[%f1_company_name%]", wizytowka_dane.f1_company_name);
		}
		else {
			wizytowka_html = wizytowka_html.replace("[%f1_company_name%]", '');
		}
		if (typeof wizytowka_dane.f1_imie_nazwisko != 'undefined') {
			wizytowka_html = wizytowka_html.replace("[%f1_imie_nazwisko%]", wizytowka_dane.f1_imie_nazwisko) ;
		}
		else {
			wizytowka_html = wizytowka_html.replace("[%f1_imie_nazwisko%]", '');
		}
		if (typeof wizytowka_dane.f1_stanowisko != 'undefined') {
			wizytowka_html = wizytowka_html.replace("[%f1_stanowisko%]", wizytowka_dane.f1_stanowisko) ;
		}
		else {
			wizytowka_html = wizytowka_html.replace("[%f1_stanowisko%]", '');
		}
		if (typeof wizytowka_dane.f1_adres_1 != 'undefined') {
			wizytowka_html = wizytowka_html.replace("[%f1_adres_1%]", wizytowka_dane.f1_adres_1) ;
		}
		else {
			wizytowka_html = wizytowka_html.replace("[%f1_adres_1%]", '');
		}
		if (typeof wizytowka_dane.f1_adres_2 != 'undefined') {
			wizytowka_html = wizytowka_html.replace("[%f1_adres_2%]", wizytowka_dane.f1_adres_2) ;
		}
		else {
			wizytowka_html = wizytowka_html.replace("[%f1_adres_2%]", '');
		}
		if (typeof wizytowka_dane.f1_adres_3 != 'undefined') {
			wizytowka_html = wizytowka_html.replace("[%f1_adres_3%]", wizytowka_dane.f1_adres_3) ;
		}
		else {
			wizytowka_html = wizytowka_html.replace("[%f1_adres_3%]", '');
		}
		if (typeof wizytowka_dane.f1_tel != 'undefined') {
			wizytowka_html = wizytowka_html.replace("[%f1_tel%]", wizytowka_dane.f1_tel) ;
		}
		else {
			wizytowka_html = wizytowka_html.replace("[%f1_tel%]", '');
		}
		if (typeof wizytowka_dane.f1_telkom != 'undefined') {
			wizytowka_html = wizytowka_html.replace("[%f1_telkom%]", wizytowka_dane.f1_telkom) ;
		}
		else {
			wizytowka_html = wizytowka_html.replace("[%f1_telkom%]", '');
		}
		if (typeof wizytowka_dane.f1_email != 'undefined') {
			wizytowka_html = wizytowka_html.replace("[%f1_email%]", wizytowka_dane.f1_email) ;
		}
		else {
			wizytowka_html = wizytowka_html.replace("[%f1_email%]", '');
		}
		if (typeof wizytowka_dane.f1_www != 'undefined') {
			wizytowka_html = wizytowka_html.replace("[%f1_www%]", wizytowka_dane.f1_www) ;
		}
		else {
			wizytowka_html = wizytowka_html.replace("[%f1_www%]", '');
		}
		if (typeof wizytowka_dane.f1_komunikator != 'undefined') {
			wizytowka_html = wizytowka_html.replace("[%f1_komunikator%]", wizytowka_dane.f1_komunikator) ;
		}
		else {
			wizytowka_html = wizytowka_html.replace("[%f1_komunikator%]", '');
		}
		if (typeof wizytowka_dane.f1_id1 != 'undefined') {
			wizytowka_html = wizytowka_html.replace("[%f1_id1%]", wizytowka_dane.f1_id1) ;
		}
		else {
			wizytowka_html = wizytowka_html.replace("[%f1_id1%]", '');
		}
		if (typeof wizytowka_dane.f1_id2 != 'undefined') {
			wizytowka_html = wizytowka_html.replace("[%f1_id2%]", wizytowka_dane.f1_id2) ;
		}
		else {
			wizytowka_html = wizytowka_html.replace("[%f1_id2%]", '');
		}
		if (typeof wizytowka_dane.f1_konto_bankowe != 'undefined') {
			wizytowka_html = wizytowka_html.replace("[%f1_konto_bankowe%]", wizytowka_dane.f1_konto_bankowe) ;
		}
		else {
			wizytowka_html = wizytowka_html.replace("[%f1_konto_bankowe%]", '');
		}
		if (typeof wizytowka_dane.f1_samochod != 'undefined') {
			wizytowka_html = wizytowka_html.replace("[%f1_samochod%]", wizytowka_dane.f1_samochod);
		}
		else {
			wizytowka_html = wizytowka_html.replace("[%f1_samochod%]", '');
		}
	}
	else {
		var lokalizacja_pliku = cordova.file.externalDataDirectory + '/wizytowki_foto/' + wizytowka_dane.plik;
		wizytowka_html += "<img class=\"wizytowka_z_pliku\" src=\"" + lokalizacja_pliku + "\" />";
	}

//	sterowanie
	wizytowka_html_sterowanie = "<table>"
			+ "<tr>"
			+ "<td id=\"td_poprzednia\"><img src=\"img/cards_wizytowka_poprzednia.svg\" id=\"wizytowka_poprzednia\"></td>"
			+ "<td id=\"td_funkcje\">"
				+ "<img src=\"img/cards_wizytowka_edytuj.svg\" id=\"wizytowka_edytuj\">"
				+ "<img src=\"img/cards_domyslna.svg\" id=\"wizytowka_domyslna\">"
				+ "<img src=\"img/cards_wizytowka_usun.svg\" id=\"wizytowka_usun\">"
				+ "<img src=\"img/cards_wizytowka_udostepnij.svg\" id=\"wizytowka_udostepnij\">"
				+ "<img src=\"img/cards_wizytowka_menu.svg\" id=\"wizytowka_menu\">"
//		share → QR →vcard → email(w treśći +vCard → SMS
			+ "</td>"
			+ "<td id=\"td_nastepna\"><img src=\"img/cards_wizytowka_nastepna.svg\" id=\"wizytowka_nastepna\"></td>"
			+ "</tr></table>";

	zamknij_wszystkie_okna(1);

	document.getElementById('okno_wizytowki').innerHTML = wizytowka_html;
	document.getElementById('wizytowka_sterowanie').innerHTML = wizytowka_html_sterowanie;

	document.getElementById('okno_wizytowki').style.display = 'block';

//		ZMIANA TLA........
	//alert("1"); - czy tu ni epowinno być www/!!!!!!!!!!!!!!!!!11
					//	if (wizytowka_dane.tlo == '') {
					//		document.body.okno_wizytowki.style.backgroundImage = "url('../img/papers/paper0002.jpg')";
					//		document.getElementById('okno_wizytowki').style.backgroundImage = "url('img/papers/paper0002.jpg')";
					//		document.getElementById('okno_wizytowki').style.backgroundImage = "url('file:///android_asset/img/papers/paper0002.jpg')";
					//alert("2");
					//		document.getElementById('okno_wizytowki').style.background = "url('file:///android_asset/img/papers/paper0002.jpg')";

					//		document.getElementById("okno_wizytowki").style.backgroundImage = "url('../img/papers/paper0002.jpg')";
					//	}
					//	else {
					//alert ("Jest tlo zapisane w pliku\n: " + wizytowka_dane.tlo);
					//		document.getElementById('okno_wizytowki').style.background = "url('../img/papers/" + wizytowka_dane.tlo + "')";
					//		document.getElementById('okno_wizytowki').style.backgroundImage = "url('../img/papers/" + wizytowka_dane.tlo + "')";
					//	}
					//alert ( "Biezace tlo:\n" + document.getElementById('okno_wizytowki').style.background +"\nfolder programu\n" + folder_programu);
					//alert("Tresc_odczytana_z_pliku 6");

//	document.getElementById('okno_wizytowki').addEventListener('touchend', wizytowka_menu_wizytowki_wyswietl, false);
	document.getElementById('okno_wizytowki').addEventListener('touchstart', dotyk_start, false);
	document.getElementById('okno_wizytowki').addEventListener('touchmove', dotyk_ruch, false);

	document.getElementById('wizytowka_poprzednia').addEventListener('touchstart', wizytowka_menu_poprzednia, false);
	document.getElementById('wizytowka_nastepna').addEventListener('touchstart', wizytowka_menu_nastepna, false);

	document.getElementById('wizytowka_menu').addEventListener('touchstart', wizytowka_menu_wizytowki_zamknij, false);
	document.getElementById('wizytowka_udostepnij').addEventListener('touchstart', wizytowka_udostepnij, false);

//	document.getElementById('wizytowka_lista').addEventListener('touchstart', zamknij_wszystkie_okna, false);
//Wyswietlanie ikon sterujacych
	if( ustawienia.domyslna == lista_wizytowek_lista[lista_wizytowek_biezaca] ) {
		document.getElementById('wizytowka_domyslna').style.display = 'none';
	}
	else {
		document.getElementById('wizytowka_domyslna').addEventListener('touchstart', wizytowka_ustaw_domyslna, false);
	}

	if ( lista_wizytowek_lista[lista_wizytowek_biezaca] == "system.cards" || wizytowka_dane.plik != '' )  {
		document.getElementById('wizytowka_edytuj').style.display = 'none';
	}
	else {
		document.getElementById('wizytowka_edytuj').addEventListener('touchstart', wizytowka_edytuj, false);
	}

	if( lista_wizytowek_lista[lista_wizytowek_biezaca] == "system.cards" ) {
		document.getElementById('wizytowka_usun').style.display = 'none';
	}
	else {
		document.getElementById('wizytowka_usun').addEventListener('touchstart', wizytowka_usun, false);
	}
	if(wyswietlaj_menu_wizytowki == 0) {
		document.getElementById('wizytowka_sterowanie').style.display = 'none';
	}
}
function wizytowka_menu_wizytowki_zamknij () {
	zamknij_wszystkie_okna();
}
function wizytowka_menu_wizytowki_wyswietl() {
	document.getElementById('wizytowka_sterowanie').style.display = 'block';

	if(wyswietlaj_menu_wizytowki_licznik) {
		clearTimeout(wyswietlaj_menu_wizytowki_licznik);
	}
	wyswietlaj_menu_wizytowki_licznik = setTimeout(wizytowka_menu_wizytowki_ukryj, 5000);
	wyswietlaj_menu_wizytowki = 1;
}
function wizytowka_menu_wizytowki_ukryj() {
	document.getElementById('wizytowka_sterowanie').style.display = 'none';
	wyswietlaj_menu_wizytowki = 0;
}
//==============DODAJ Z APARATU
//	Camera.PictureSourceType.CAMERA (the default),
//	Camera.PictureSourceType.PHOTOLIBRARY
//	Camera.PictureSourceType.SAVEDPHOTOALBUM.
function menu_dodaj_wiz_z_aparatu() {
	zamknij_wszystkie_okna();

	navigator.camera.getPicture(menu_dodaj_wiz_z_pliku_pobierz, fail, {
		quality: 50,
		allowEdit: false,
		correctOrientation: 1,
		saveToPhotoAlbum: 0,
		destinationType: Camera.DestinationType.FILE_URI });
}
function menu_dodaj_wiz_z_galerii() {
	zamknij_wszystkie_okna();
	navigator.camera.getPicture(menu_dodaj_wiz_z_pliku_pobierz, fail, {
		quality: 50,
		allowEdit: true,
		sourceType: Camera.PictureSourceType.PHOTOLIBRARY });
//	navigator.camera.getPicture(menu_dodaj_wiz_z_pliku_pobierz, fail, { quality: 50, destinationType: Camera.destinationType.NATIVE_URI, sourceType: Camera.PictureSourceType.PHOTOLIBRARY });
//	navigator.camera.getPicture(menu_dodaj_wiz_z_pliku_pobierz, fail, { quality: 50, destinationType: Camera.DestinationType.FILE_URI });
}
function menu_dodaj_wiz_z_pliku_pobierz(zdjecie_url) {

	document.getElementById('okno_pobierania_zdjecia').innerHTML = '';

	var foto_html = '';

	zdjecie = zdjecie_url;

	if(zdjecie != '') {
		foto_html += "<img id=\"zdjecie\" src=\"" + zdjecie + "\"><br>&nbsp;<br>"
		+ "<img class=\"menu\" onclick=\"zamknij_wszystkie_okna()\" src=\"img/cards_cofnij.svg\" alt=\"*\">"
		+ "<img class=\"menu\" onclick=\"menu_dodaj_wiz_z_aparatu_zapisz()\" src=\"img/cards_plus.svg\" alt=\"*\">"
		;
	}
	else {
		alert(l__.nie_wybrano_zdjecia);
	}
	document.getElementById('okno_pobierania_zdjecia').innerHTML = foto_html;
	document.getElementById('okno_pobierania_zdjecia').style.display = 'block';
}
function menu_dodaj_wiz_z_aparatu_zapisz() {

	plik_nazwa = utworz_nazwe_pliku('.card');

	window.resolveLocalFileSystemURI(zdjecie,
			function(file) {
				 file.moveTo(folder_wizytowki_foto, plik_nazwa, menu_dodaj_wiz_z_aparatu_zapisz_dane, fail);
			}, fail);
}
function menu_dodaj_wiz_z_aparatu_zapisz_dane() {
//alert ("skopiowano plik\n" + plik_nazwa);

	wizytowka_zapisz();
	zamknij_wszystkie_okna();
}
//============INNE
function wizytowka_menu_poprzednia() {

	lista_wizytowek_biezaca --;
	if(lista_wizytowek_biezaca < 0) {
		lista_wizytowek_biezaca = lista_wizytowek_lista.length - 1;
	}
	wyswietl_wizytowke(lista_wizytowek_lista[lista_wizytowek_biezaca]);
}
function wizytowka_menu_nastepna() {
	lista_wizytowek_biezaca ++;
	var ilosc_wizytowek = lista_wizytowek_lista.length - 1 ;
	if ( lista_wizytowek_biezaca > ilosc_wizytowek ) {
		lista_wizytowek_biezaca = 0;
	}
	wyswietl_wizytowke(lista_wizytowek_lista[lista_wizytowek_biezaca]);
}
function wizytowka_dodaj_wyzeruj_pola() {
//alert("zerowanie pol")
//	document.getElementById('f1_nazwa').value = '';
	document.getElementById('f1_company_name').value = '';
	document.getElementById('f1_imie_nazwisko').value = '';
	document.getElementById('f1_stanowisko').value = '';
	document.getElementById('f1_adres_1').value = '';
	document.getElementById('f1_adres_2').value = '';
	document.getElementById('f1_adres_3').value = '';
	document.getElementById('f1_tel').value = '';
	document.getElementById('f1_telkom').value = '';
	document.getElementById('f1_email').value = '';
	document.getElementById('f1_www').value = '';
	document.getElementById('f1_komunikator').value = '';
	document.getElementById('f1_id1').value = '';
	document.getElementById('f1_id2').value = '';
	document.getElementById('f1_konto_bankowe').value = '';
	document.getElementById('f1_samochod').value = '';
//alert("zerowanie pol koniec")
//alert ("grupa \n" + l__.grupa0);
//ustawienie placeolder (jezyk)
//	document.getElementById('f1_nazwa').placeholder = l__.opis_wizytowki;
	document.getElementById('wprowadz_tresc_wizytowki').innerHTML = l__.wprowadz_tresc_wizytowki;
	document.getElementById('wprowadz_tresc_wizytowki_info').innerHTML = l__.nieobowiazkowe;
	document.getElementById('f1_company_name').placeholder = l__.nazwa_firmy;
	document.getElementById('f1_imie_nazwisko').placeholder = l__.imie_i_nazwisko;
	document.getElementById('f1_stanowisko').placeholder = l__.stanowisko;
	document.getElementById('f1_adres_1').placeholder = l__.adres1;
	document.getElementById('f1_adres_2').placeholder = l__.adres2;
	document.getElementById('f1_adres_3').placeholder = l__.adres3;
	document.getElementById('f1_tel').placeholder = l__.tel;
	document.getElementById('f1_telkom').placeholder = l__.telkom;
	document.getElementById('f1_email').placeholder = l__.adres_email;
	document.getElementById('f1_www').placeholder = l__.adres_www;
	document.getElementById('f1_komunikator').placeholder = l__.komunikator;
	document.getElementById('f1_id1').placeholder = l__.id1;
	document.getElementById('f1_id2').placeholder = l__.id2;
	document.getElementById('f1_konto_bankowe').placeholder = l__.konto_bankowe;
	document.getElementById('f1_samochod').placeholder = l__.samochod;

//alert("Test\n" + l__.samochod + "\n" + l__.konto_bankowe);
}

//=========== edycja

function wizytowka_edytuj () {
//	navigator.notification.vibrate(300);

	zamknij_wszystkie_okna();
	document.getElementById('menu_dodaj_wiz_z_klawiatury').style.display = 'block';
	wizytowka_dodaj_wyzeruj_pola();

	document.getElementById('wprowadz_tresc_wizytowki').innerHTML = l__.edytuj_tresc_wizytowki;
	document.getElementById('wprowadz_tresc_wizytowki_info').innerHTML = '';
	document.getElementById('f1_company_name').value = wizytowka_dane.f1_company_name;
	document.getElementById('f1_imie_nazwisko').value = wizytowka_dane.f1_imie_nazwisko;
	document.getElementById('f1_stanowisko').value = wizytowka_dane.f1_stanowisko;
	document.getElementById('f1_adres_1').value = wizytowka_dane.f1_adres_1;
	document.getElementById('f1_adres_2').value = wizytowka_dane.f1_adres_2;
	document.getElementById('f1_adres_3').value = wizytowka_dane.f1_adres_3;
	document.getElementById('f1_tel').value = wizytowka_dane.f1_tel;
	document.getElementById('f1_telkom').value = wizytowka_dane.f1_telkom;
	document.getElementById('f1_email').value = wizytowka_dane.f1_email;
	document.getElementById('f1_www').value = wizytowka_dane.f1_www;
	document.getElementById('f1_komunikator').value = wizytowka_dane.f1_komunikator;
	document.getElementById('f1_id1').value = wizytowka_dane.f1_id1;
	document.getElementById('f1_id2').value = wizytowka_dane.f1_id2;
	document.getElementById('f1_konto_bankowe').value = wizytowka_dane.f1_konto_bankowe;
	document.getElementById('f1_samochod').value = wizytowka_dane.f1_samochod;
	edycja = 1;
}

//=========== usuwanie
function wizytowka_usun () {
//	navigator.notification.vibrate(600);
//alert ("Usun: " + nazwa_pliku);
	var buttonLabels = l__.anuluj + ',' + l__.usun;
	navigator.notification.confirm(l__.usun_wizytowke, wizytowka_usun_potwierdz, l__.potwierdz_usuniecie, buttonLabels);
}
function wizytowka_usun_potwierdz (nacisniety_przycisk) {
//alert("Naciśnięto: " + nacisniety_przycisk);
	if (lista_wizytowek_lista[lista_wizytowek_biezaca] == ustawienia.domyslna) {
		ustawienia.domyslna = '';
		ustawienia_zapisz();
	}
	if ( nacisniety_przycisk == 2 ) {
		folder_wizytowki.getFile(lista_wizytowek_lista[lista_wizytowek_biezaca], {create: false, exclusive: false}, wizytowka_usun_2, fail);
	}
}

function wizytowka_usun_2 (wizytowka_usun_getfile) {
//alert("wiz przed usunieciem");
	wizytowka_usun_getfile.remove( wizytowka_usun_3, function (blad) { alert(l__.blad_usuwanie_wizytowki); } );
}

function wizytowka_usun_3 () {
//alert ("Usunieto plik podstawowy\nwizytowka_dane.plik: " + wizytowka_dane.plik);

	if ( wizytowka_dane.plik != '' ) {
		folder_wizytowki_foto.getFile(lista_wizytowek_lista[lista_wizytowek_biezaca], {create: false, exclusive: false},
			function(wiz) {
//alert("Foto przed usunieciem");
				wiz.remove(function ( wiz ) {
//alert("Foto usuniete");
			}, function(err) {	alert ("Nie można usunąć pliku obrazu" + err); }
			);
		},
		function(err) {	alert ("Nie można usunąć pliku wizytowki" + err); }
		);
	}
//	usuniecie z tabeli
//alert ("Ilość wizytowek: " + lista_wizytowek_lista.length );
	lista_wizytowek_lista.splice(lista_wizytowek_biezaca, 1);
//alert ("Ilość wizytowek: " + lista_wizytowek_lista.length );
	lista_wizytowek_biezaca --;
	if(lista_wizytowek_biezaca < 0) {
		lista_wizytowek_biezaca = 0;
	}
	if(lista_wizytowek_biezaca > lista_wizytowek_lista.length) {
		lista_wizytowek_biezaca = 0;
	}
	if(lista_wizytowek_lista.length <= 0 ) {
//		teoretycznie zawsze będzie wizytówka systemowa
		zamknij_wszystkie_okna();
	}
	else {
//alert ( lista_wizytowek_lista[lista_wizytowek_biezaca] );
		wyswietl_wizytowke(lista_wizytowek_lista[lista_wizytowek_biezaca]);
	}wizytowka_usun_3

	alert (l__.wizytowka_skasowana);

}
//=========== usuwanie koniec

function wizytowka_ustaw_domyslna() {
	ustawienia.domyslna = lista_wizytowek_lista[lista_wizytowek_biezaca];
	ustawienia_zapisz();
	alert (l__.ustawiona_jako_domyslna);
}
function wizytowka_udostepnij() {
//alert ("udostepnij");

	var tresc_wiadomosci = '';
	var tresc_vcard = '';;
	var share_plik = null;
	var share_link = null;

//jezeli to text to utworz tresc e-mail i vCard

	if(wizytowka_dane.plik == '' ) {

		tresc_wiadomosci += l__.share_naglowek + "\n\n";

		if (typeof wizytowka_dane.f1_company_name != 'undefined') {
			tresc_wiadomosci += l__.share_company_name + " " + wizytowka_dane.f1_company_name + "\n";
		}
		if (typeof wizytowka_dane.f1_imie_nazwisko != 'undefined') {
			tresc_wiadomosci += l__.share_imie_nazwisko + " " + wizytowka_dane.f1_imie_nazwisko + "\n" ;
		}
		if (typeof wizytowka_dane.f1_stanowisko != 'undefined') {
			tresc_wiadomosci += l__.share_stanowisko + " " + wizytowka_dane.f1_stanowisko + "\n" ;
		}
		if (typeof wizytowka_dane.f1_adres_1 != 'undefined') {
			tresc_wiadomosci += l__.share_adres_1 + " " + wizytowka_dane.f1_adres_1 + "\n" ;
		}
		if (typeof wizytowka_dane.f1_adres_2 != 'undefined') {
			tresc_wiadomosci += l__.share_adres_2 + " " + wizytowka_dane.f1_adres_2 + "\n" ;
		}
		if (typeof wizytowka_dane.f1_adres_3 != 'undefined') {
			tresc_wiadomosci += l__.share_adres_3 + " " + wizytowka_dane.f1_adres_3 + "\n" ;
		}
		if (typeof wizytowka_dane.f1_tel != 'undefined') {
			tresc_wiadomosci += l__.share_tel + " " + wizytowka_dane.f1_tel + "\n" ;
		}
		if (typeof wizytowka_dane.f1_telkom != 'undefined') {
			tresc_wiadomosci += l__.share_telkom + " " + wizytowka_dane.f1_telkom + "\n" ;
		}
		if (typeof wizytowka_dane.f1_email != 'undefined') {
			tresc_wiadomosci += l__.share_email + " " + wizytowka_dane.f1_email + "\n" ;
		}
		if (typeof wizytowka_dane.f1_www != 'undefined') {
			tresc_wiadomosci += l__.share_www + " " + wizytowka_dane.f1_www + "\n" ;
		}
		if (typeof wizytowka_dane.f1_komunikator != 'undefined') {
			tresc_wiadomosci += l__.share_komunikator + " " + wizytowka_dane.f1_komunikator + "\n";
		}
		if (typeof wizytowka_dane.f1_id1 != 'undefined') {
			tresc_wiadomosci += l__.share_id1 + " " + wizytowka_dane.f1_id1 + "\n" ;
		}
		if (typeof wizytowka_dane.f1_id2 != 'undefined') {
			tresc_wiadomosci += l__.share_id2 + " " + wizytowka_dane.f1_id2 + "\n" ;
		}
		if (typeof wizytowka_dane.f1_konto_bankowe != 'undefined') {
			tresc_wiadomosci += l__.share_konto_bankowe + " " + wizytowka_dane.f1_konto_bankowe + "\n" ;
		}
		if (typeof wizytowka_dane.f1_samochod != 'undefined') {
			tresc_wiadomosci += l__.share_samochod + " " + wizytowka_dane.f1_samochod + "\n";
		}
	}
	else {
		share_plik = cordova.file.externalDataDirectory + '/wizytowki_foto/' + wizytowka_dane.plik;
//alert ("PLIK\n" + share_plik);
	}

//TODO jezeli to text to utworz tresc vCard -> zapis do pliku i podać link jako parametr

	window.plugins.socialsharing.share(tresc_wiadomosci, l__.share_temat, share_plik, share_link);
}

//============techniczne
function dotyk_start (evt) {
    x_down = evt.touches[0].clientX;
    y_down = evt.touches[0].clientY;
	wizytowka_menu_wizytowki_wyswietl();
};
function dotyk_ruch (evt) {
    if ( x_down && y_down ) {

		var x_up = evt.touches[0].clientX;
		var y_up = evt.touches[0].clientY;
		var x_roznica = x_down - x_up;
		var y_roznica = y_down - y_up;

		if ( Math.abs(x_roznica ) > Math.abs( y_roznica ) ) {
			if ( x_roznica > 0 ) {
//alert (x_roznica);
				wizytowka_menu_poprzednia()

			}
			else {
				wizytowka_menu_nastepna();
			}
		}
		else {
			if ( y_roznica > 0 ) {
//				przejscie do wyswietlania kodu QR
			}
			else {
//				jw.
			}
		}
		x_down = null;
		y_down = null;
    }
};
function wizytowka_odczytaj_tresc_systemowa() {
	var tresc_jak_z_pliku = '';
	var html_tresc = '';

	html_tresc = "<img src=\"img/cards_logo_kolor.svg\" id=\"wiz_logo_cards\">"
	+ "<form action=\"https://www.paypal.com/cgi-bin/webscr\" method=\"post\" target=\"_top\">"
		+ "<input type=\"hidden\" name=\"cmd\" value=\"_donations\">"
		+ "<input type=\"hidden\" name=\"business\" value=\"lucjan@szreter.net\">"
		+ "<input type=\"hidden\" name=\"lc\" value=\"" + ustawienia.lang + "\">"
		+ "<input type=\"hidden\" name=\"item_name\" value=\"Dotacja\">"
		+ "<input type=\"hidden\" name=\"item_number\" value=\"Cards\">"
		+ "<input type=\"hidden\" name=\"currency_code\" value=\"EUR\">"
		+ "<input type=\"hidden\" name=\"bn\" value=\"PP-DonationsBF:btn_donate_LG.gif:NonHosted\">"
		+ "<input type=\"image\" id=\"wiz_przekaz\" src=\"lang/" + ustawienia.lang + "/przekaz_darowizne.svg\" border=\"0\" name=\"submit\" alt=\"*\">"
		+ "<img alt=\"*\" border=\"0\" src=\"https://www.paypalobjects.com/pl_PL/i/scr/pixel.gif\" width=\"1\" height=\"1\">"
	+ "</form>"
	+ "<h1>" + l__.program_podoba + "</h1>"
	+ "<h2>" + l__.program_przekaz_dotacje + "</h2>"
	+ "<h2>" + l__.dziekuje + "</h2>"
	;
	tresc_jak_z_pliku = "typ=html\n"
	+ "html=" + html_tresc + "\n"
	;

	wyswietl_wizytowke_odczytaj_tresc(tresc_jak_z_pliku);
}

function nacisnieto_powrot () {
	lista_wizytowek_biezaca = -1;
	zamknij_wszystkie_okna();
}
//function nacisnieto_powrot_z_menu () {
//	document.getElementById('okno_mg').style.display = 'none';
////	document.addEventListener("backbutton", nacisnieto_powrot, false);
//}
function nacisnieto_menu() {
	var tresc_menu = '';

	tresc_menu += "<div id=\"mg_dodaj_z_klawiatury\">" + l__.menu_glowne_dodaj_z_klawiatury + "</div>"
				+ "<div id=\"mg_dodaj_z_aparatu\">" + l__.menu_glowne_dodaj_z_aparatu + "</div>"
				+ "<div id=\"mg_dodaj_z_galerii\">" + l__.menu_glowne_dodaj_z_galerii + "</div>"
				+ "<div id=\"mg_edytuj\">" + l__.menu_glowne_edytuj + "</div>"
				+ "<div id=\"mg_usun\">" + l__.menu_glowne_usun + "</div>"
				+ "<div id=\"mg_domyslna\">" + l__.menu_glowne_domyslna + "</div>"
				+ "<div id=\"mg_share\">" + l__.menu_glowne_share + "</div>"
				+ "<div id=\"mg_pomoc\">" + l__.menu_glowne_pomoc + "</div>"
				+ "<div id=\"mg_o_programie\">" + l__.menu_glowne_o_programie + "</div>"
				+ "<div id=\"mg_ustawienia\">" + l__.menu_glowne_ustawienia + "</div>"
				;


//alert("Biezaca wizytowka: " + lista_wizytowek_biezaca );

	document.getElementById('okno_mg').innerHTML = tresc_menu;
//	document.removeEventListener("backbutton", false, false);
//	document.addEventListener("backbutton", nacisnieto_powrot_z_menu, false);

	document.getElementById('mg_dodaj_z_klawiatury').addEventListener('touchstart', menu_dodaj_wiz_z_klawiatury, false);
	document.getElementById('mg_dodaj_z_aparatu').addEventListener('touchstart', menu_dodaj_wiz_z_aparatu, false);
	document.getElementById('mg_dodaj_z_galerii').addEventListener('touchstart', menu_dodaj_wiz_z_galerii, false);
	document.getElementById('mg_share').addEventListener('touchstart', wizytowka_udostepnij, false);
	document.getElementById('mg_ustawienia').addEventListener('touchstart', ustawienia_pokaz, false);
	document.getElementById('mg_pomoc').addEventListener('touchstart', pomoc_pokaz, false);
	document.getElementById('mg_o_programie').addEventListener('touchstart', o_programie_pokaz, false);
	document.getElementById('mg_edytuj').addEventListener('touchstart', wizytowka_edytuj, false);
	document.getElementById('mg_usun').addEventListener('touchstart', wizytowka_usun, false);
	document.getElementById('mg_domyslna').addEventListener('touchstart', wizytowka_ustaw_domyslna, false);

	if (lista_wizytowek_biezaca < 0 || lista_wizytowek_lista[lista_wizytowek_biezaca] == 'system.cards') {
		document.getElementById('mg_edytuj').style.display = 'none';
		document.getElementById('mg_usun').style.display = 'none';
		document.getElementById('mg_domyslna').style.display = 'none';
		document.getElementById('mg_share').style.display = 'none';
	}
	else {
		document.getElementById('mg_edytuj').style.display = 'block';
		document.getElementById('mg_usun').style.display = 'block';
		document.getElementById('mg_domyslna').style.display = 'block';
		document.getElementById('mg_share').style.display = 'block';
	}
	if( wizytowka_dane.plik != '')  {
		document.getElementById('mg_edytuj').style.display = 'none';
	}

	document.getElementById('okno_mg').style.display = 'block';
}

function ustawienia_pokaz () {
	zamknij_wszystkie_okna();
	document.getElementById('okno_ustawienia').style.display = 'block';
	document.getElementById('okno_mg').innerHTML = "Ustawienia";
}
function pomoc_pokaz () {
	zamknij_wszystkie_okna();

	var tresc_html = "<iframe src=\"lang/" + ustawienia.lang + "/pomoc.html\"></iframe>";
	document.getElementById('okno_pomoc').innerHTML = tresc_html;

	document.getElementById('okno_pomoc').style.display = 'block';
}
function o_programie_pokaz () {
	zamknij_wszystkie_okna();

	var tresc_html = "<iframe src=\"lang/" + ustawienia.lang + "/o_programie.html\"></iframe>";

	document.getElementById('okno_o_programie').innerHTML = tresc_html;
	document.getElementById('okno_o_programie').style.display = 'block';
}
function ustal_id_wizytowki_po_nazwie(nazwa_szukana) {
	var ilosc = lista_wizytowek_lista.length;
	var i;

	if(nazwa_szukana == '')	{
		return -1;
	}
	else {
		for( i = 0; i < ilosc; i++) {
			if(lista_wizytowek_lista[i] == nazwa_szukana) {
				return i;
			}
		}
	}

//alert("ustal po nazwie: " + lista_wizytowek_biezaca + "\nNazwa: " + nazwa_szukana);

}
//tylko blackberry
//function nacisnieto_vol_down() {
//	wizytowka_menu_poprzednia();
//}
//function nacisnieto_vol_up() {
//	wizytowka_menu_nastepna();
//}
function menu_udostepnij_program() {
	var share_tresc;
	var share_temat;
	var share_link;
	var share_plik;

//TODO -zmienic na link do sklepu play store lub do innego odpowiedniego w zaleznosci od platformy
	switch (device.platform) {
		case 'Android':
			share_link = 'http://szreter.net/cards';
//			share_plik = cordova.file.applicationDirectory + '';
			break;
		case 'BlackBerry':
			share_link = 'http://szreter.net/cards';
			break;
		case 'iPhone' || 'iPad' || 'iPhone Simulator' || 'iPad Simulator':
			share_link = 'http://szreter.net/cards';
			break;
		case 'webOS':
			share_link = 'http://szreter.net/cards';
			break;
		case 'winCE':
			share_link = 'http://szreter.net/cards';
			break;
		default:
			share_link = 'http://szreter.net/cards';
	}

	share_temat = l__.share_program_temat;
	share_tresc = l__.share_program_tresc;
//TODO dołacznie obrazka
//	share_plik = "www://img/cards_share.png";
//	share_plik = "file:///android_asset/www/img/cards_share.png";
	share_plik = null;
	window.plugins.socialsharing.share(share_tresc, share_temat, share_plik, share_link);
}