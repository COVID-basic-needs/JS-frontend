//POPOVERS
$('body')
  .on('mousedown', '.popover', function(e) {
    e.preventDefault()
});


var about = `<p>Darcie is an automated phone line anyone can call to find human services near them, such as free food, legal assistance, non-emergency medical help, and more. Read more and watch a live stream of the conversations at <a href="http://www.darcie.me">darcie.me</a> <br/> <b>COVID-19 Update</b> Darcie was intended to pull from all services listed in the <a href="https://sfserviceguide.org/">SF Service Guide</a>, however in the current times the format of the data in that database (a.k.a. <a href="https://github.com/sheltertechsf/askdarcel-api">AskDarcel on github</a>) made it hard to keep the information up to date with service hours & offerings changing. We pivoted Darcie to pull from a seperate Algolia index which consists of all hygiene stations & places handing out food in SF. The dialog & webhook have been adopted accordingly.</p>`
$('#about').popover({
    content: about,
    trigger: 'focus'

})

var contactInfo = `<p>Contributing, Branching, & Forking
While we actively accept help, as well as encourage you to fork this repo and build it out for your city, we do not take pull requests directly to this repo - please contact us before you plan to do so. Reach out to: </br>
<a href = "https://github.com/ShelterTechSF/VACS-MVP">Github</a> 
 Twitter <a href="https://twitter.com/dariceshelter">@dariceshelter</a></p>`

$('#contact').popover({
    content: contactInfo,
    trigger: 'focus'

})

//FORM SUBMISSION
$('#submit').click(function(){
    codeAddress($("#zipCode").val())
});

$('body').on('keypress', '#zipCode', function(args) {
    if (args.keyCode == 13) {
        $('#submit').click();
        return false;
    }
});

//FILTER RESULTS
$('#filter').click(function(){
    $('#checkboxes').collapse('toggle')
});