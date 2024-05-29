export const getUserRating = (ethBalance, solBalance, followers) => {
    
    try {
        var ethValue = 0;

        if (ethBalance < 500) {
            ethValue = 1;
        } else if (ethBalance < 3000) {
            ethValue = 1.5;
        } else if (ethBalance < 10000) {
            ethValue = 3;
        } else if (ethBalance < 25000) {
            ethValue = 7;
        } else if (ethBalance < 100000) {
            ethValue = 10;
        } else if (ethBalance < 500000) {
            ethValue = 15;
        } else {
            ethValue = 25;
        }

        var solValue = 0;

        if (solBalance < 500) {
            solValue = 1;
        } else if (solBalance < 3000) {
            esolalue = 1.5;
        } else if (solBalance < 10000) {
            solValue = 3;
        } else if (solBalance < 25000) {
            solValue = 7;
        } else if (solBalance < 100000) {
            solValue = 10;
        } else if (solBalance < 500000) {
            solValue = 15;
        } else {
            solValue = 25;
        }

        var twitterValue = 0;

        if (followers < 1000) {
            twitterValue = 1;
        } else if (followers < 3000) {
            twitterValue = 2;
        } else if (followers < 10000) {
            twitterValue = 5;
        } else if (followers < 25000) {
            twitterValue = 10;
        } else if (followers < 100000) {
            twitterValue = 12;
        } else if (followers < 300000) {
            twitterValue = 15;
        } else if (followers < 1000000) {
            twitterValue = 20;
        } else {
            twitterValue = 25
        }
        
        return ethValue + solValue + twitterValue;

    } catch (err) {
        console.log(err);
        return 0;
    }
}