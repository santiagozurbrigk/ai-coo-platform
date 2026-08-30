---
title: "Name and Phone Number Tracking with the Universal Script"
source: "https://docs.hyros.com/docs/name-phone-tracking"
seccion: "Home > Additional Resources"
capturado: "2026-08-30"
---

# Name and Phone Number Tracking with the Universal Script

Track name and phone number with the Universal Script

Overview

Hyros will automatically track data in any field in the back end of "Name", "First Name", "Last Name" or "Full Name" however, these labels are not present in every scenario and because of this Hyros will not pick up data from fields with labels having any different characters (such as "State Name", "Country Name" etc.), since that would open the door to the possibility of tracking names that aren't actually names.

For specific cases please follow the steps listed below to manually add the Hyros class to the desired name field for extra name tracking accuracy.

1

## Tracking Names

It is possible to track names with our Universal Script which is beneficial to send more conversion data and through it increase the "matching quality" of events inside Ad platforms.

To successfully track names with the universal tracking code its required to edit the Name field code in our forms manually to include the Hyros class:

**hyros-first-name**

,

**hyros-last-name**

,

**hyros-full-name**

respectively, this way the Universal Code will identify the field classes and use them to track the Lead's info.

For our sample scenario the user has a form with the following HTML code:

code

```
<form action ="/action_page.php">
  <label for ="fname">First name:</label>
  <input type="text" id="fname" name="fname">
  <label for="lname">Last name:</label>
  <input type="text" id="lname" name="lname">
  <input type="submit" value="Submit">
</form>
```

After editing the fields, the code should look like this:

code

```
<form action ="/action_page.php">
  <label for ="fname">First name:</label>
  <input type="text" id="fname" class="hyros-first-name" name="fname">
  <label for="lname">Last name:</label>
  <input type="text" id="lname" class="hyros-last-name" name="lname">
  <input type="submit" value="Submit">
</form>
```

OR

code

```
<form action ="/action_page.php">
  <label for="full_name">Full name:</label>
  <input type="text" id="full_name" class="hyros-full-name" name="full_name">
  <input type="submit" value="Submit">
</form>
```

By doing this Hyros' Universal code will identify the fields and assign the data to the Lead.

---

## Track First and/or Last name data from URL (Alternative Method)

In case we do not want to edit classes in our universal script, we can also capture the first and last name data from the URL. To do this we just need to make sure we are sending the right details to the URL with the appropriate labels.

Our goal is for the resulting URL to look similar to the one below:

**E.g.**

http://www.yourthankupage.com/?first-name=John

For reference, here's the list of variants Hyros recognizes for First and Last name tracking:

Please contact your Onboarding Analyst if you have any questions regarding this process.

---

2

## Tracking Phone Numbers

Using the same principle we can add a similar script to track phone numbers.

code

```
<label for="hyros-phone">Phone number:</label>
<input type="text" id="hyros-phone" class="hyros-phone" name="hyros-phone">
```

After adding this line the code should look something similar to this:

code

```
<form action ="/action_page.php">
  <label for ="fname">First name:</label>
  <input type="text" id="fname" class="hyros-first-name" name="fname">
  <label for="lname">Last name:</label>
  <input type="text" id="lname" class="hyros-last-name" name="lname">
  <label for="hyros-phone">Phone number:</label>
  <input type="text" id="hyros-phone" class="hyros-phone" name="hyros-phone">
  <input type="submit" value="Submit">
</form>
```

Name matching does not really affect tracking or its accuracy but can help us optimize ads to increase results. Specific customer information can be sent along with our optimization events which can help attribute more conversions to the right sources and reach more potential (high quality) leads.

The main goal is to improve the number of conversions being attributed potential reach/audience size while at the same time the cost per conversion decreases.

---

## Tracking Phone Numbers from URL (Alternative Method)

In case you do not want to edit the class of the phone field, or the funnel/form builder does not allow you, we can also capture the first and last name data from the URL. To do this we just need to make sure we are passing the phone number to the redirect URL with the appropriate label.

Our goal is for the resulting URL to look similar to the one below:

E.g. [http://www.yourthankupage.com/?phone=2125551234](http://www.yourthankupage.com/?phone=2125551234)

For reference, here's the list of variants Hyros recognizes for Phone Number tracking:

## FAQ
