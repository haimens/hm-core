(() => {

    const promise = new Promise((resolve, reject) => {
        const num = Math.ceil(Math.random() * 98);
        resolve(num);
    });


    promise
        .then(result_num => {
            console.log('result_num', result_num);
            return result_num * 7;
        })
        .then(sec_num => {
            console.log('sec_num', sec_num);
            return sec_num - 2
        })
        .then(third_num => {
            console.log('thrid_num', third_num);
            return new Promise((resolve, reject) => {
                const fourth_num = Math.ceil(Math.random() * 12);
                console.log('fourth_num', fourth_num);
                resolve(third_num + fourth_num);
            });
        })
        .then(fifth_num => {

            console.log('fifth_num', fifth_num);

            return fifth_num - ;
        })
        .then(six_num => {
            console.log(six_num);
        });
})();