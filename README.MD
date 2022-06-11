# Timings v2.1
This is a side project I'm working on I'm calling Timings v2.1
It's *not* official and is a pet project I'm spending time on when I get chance.

## Why v2.1?
I'm naming this v2.1 as it intends to stay compliant with v2's API endpoint paths and format.
It's intended to be compatible with v2's UI as well.

## WIP
The project is work in progress and a lot has to to change and be improved.
The code is already due a tidy up and will be repeatedly as the project nears being 100% compliant with Paper and Timings v2 UI.

Currently, Paper can successfully post its timings to v2.1 without issue.
The v2 Timings UI isn't currently compatible without crashing due to the history request not being implemented properly.
When the history endpoint is implemented correctly the project should be useable.

The cached data currently sits on disk and shoud really be stored in some form of cache such as Redis or MySQL.

## End Goal
The end goal is for this to be an up to date, maintainble and scaleable timings solution for PaperMC.
The UI's final design is intended to be matched to the PaperMC website/forum style with the final goal being to donate this project to PaperMC.
If they wish to have it.. that is..

## Contributing
Please feel free to PR contributions, though I'd like to try and get towards 100% compatability with Timings v2 before major UI modifications or any other modifications.