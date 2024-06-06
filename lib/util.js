export const getUserRating = (ethBalance, solBalance, followers, location) => {
    
    try {
        var ethValue = 0;

        if (ethBalance < 300) {
            ethValue = 0.5;
        } else if (ethBalance < 800) {
            ethValue = 1;
        } else if (ethBalance < 1500) {
            ethValue = 1.5;
        } else if (ethBalance < 2500) {
            ethValue = 2.5;
        } else if (ethBalance < 5000) {
            ethValue = 3.5;
        } else if (ethBalance < 10000) {
            ethValue = 5;
        } else if (ethBalance < 25000) {
            ethValue = 7;
        } else if (ethBalance < 100000) {
            ethValue = 10;
        } else {
            ethValue = 15;
        }

        var solValue = 0;

        if (solBalance < 300) {
            solValue = 0.5;
        } else if (solBalance < 800) {
            solValue = 1;
        } else if (solBalance < 1500) {
            solValue = 1.5;
        } else if (solBalance < 2500) {
            solValue = 2.5;
        } else if (solBalance < 5000) {
            solValue = 3.5;
        } else if (solBalance < 10000) {
            solValue = 5;
        } else if (esolalance < 25000) {
            solValue = 7;
        } else if (solBalance < 100000) {
            solValue = 10;
        } else {
            solValue = 15;
        }

        var twitterValue = 0;

        if (followers < 300) {
            twitterValue = 0.5;
        } else if (followers < 800) {
            twitterValue = 1.5;
        } else if (followers < 1500) {
            twitterValue = 2;
        } else if (followers < 2500) {
            twitterValue = 2.5;
        } else if (followers < 5000) {
            twitterValue = 3.5;
        } else if (followers < 10000) {
            twitterValue = 5;
        } else if (followers < 25000) {
            twitterValue = 7;
        } else if (followers < 100000) {
            twitterValue = 10;
        } else {
            twitterValue = 15;
        }
        
        var locationValue = 0;

        if (location == "United States" || location == "Canada" || location == "United Kingdom" || location == "Germany" || location == "France" || location == "Italy" || location == "Russia" || location == "Spain" || location == "Netherlands" || location == "Switzerland" || location == "Poland" || location == "Belgium" || location == "Dubai" || location == "Singapore") {
            locationValue = 1
        }
        return ethValue + solValue + twitterValue + locationValue;

    } catch (err) {
        console.log(err);
        return 0;
    }
}